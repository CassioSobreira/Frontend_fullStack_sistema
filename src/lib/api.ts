// Normaliza a URL da API removendo barra final e garantindo formato correto
const getApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  // Remove barras no final
  return url.replace(/\/+$/, '');
};

const API_BASE_URL = getApiBaseUrl();

export interface User {
  id: string;
  email: string;
  name: string;
  dateOfBirth: string;
  googleId: string | null;
  role: 'client' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  permissions: string[];
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  dateOfBirth: string;
  role?: 'client' | 'admin';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface GoogleLoginData {
  idToken: string;
}

export interface RefreshTokenData {
  refreshToken: string;
}

export interface ValidateTokenData {
  token: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  user: User;
  permissions: string[];
  token: {
    subject: string;
    email: string;
    role: string;
  };
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Garante que o endpoint começa com /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // Remove barras duplas que possam ocorrer
    const url = `${this.baseURL}${normalizedEndpoint}`.replace(/([^:]\/)\/+/g, '$1');
    
    // Timeout de 30 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    // Se já houver um signal nas options, combina com o nosso
    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }
    
    const config: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Garante que não há redirecionamento automático que possa causar problemas com CORS
      redirect: 'error' as RequestRedirect,
    };

    let response: Response;
    try {
      response = await fetch(url, config);
      clearTimeout(timeoutId);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Tempo de requisição excedido. Verifique sua conexão.');
      }
      if (error instanceof TypeError) {
        if (error.message.includes('fetch')) {
          throw new Error('Erro de conexão. Verifique se o servidor está rodando e a URL da API está correta.');
        }
        if (error.message.includes('Failed to fetch')) {
          throw new Error(`Erro de conexão com a API. Verifique se a URL está correta: ${url}`);
        }
        if (error.message.includes('CORS')) {
          throw new Error('Erro de CORS. Verifique se o backend está configurado para aceitar requisições desta origem.');
        }
      }
      // Se for erro de redirecionamento, fornece mensagem mais clara
      if (error.message && error.message.includes('redirect')) {
        throw new Error(`Erro de redirecionamento. Verifique se a URL da API está correta (sem barra final): ${this.baseURL}`);
      }
      throw error;
    }

    // Verifica se houve redirecionamento (não deveria acontecer com redirect: 'error')
    if (response.redirected) {
      throw new Error(`A URL da API foi redirecionada. Verifique se a URL está correta: ${this.baseURL}`);
    }

    // Verifica se a resposta é do tipo CORS error (status 0 geralmente indica erro de CORS)
    if (response.status === 0) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'esta origem';
      throw new Error(`Erro de CORS. Verifique se o backend está configurado para aceitar requisições de ${origin}. URL da API: ${this.baseURL}`);
    }

    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`;
      
      // Mensagens específicas para erros comuns
      if (response.status === 404) {
        errorMessage = `Endpoint não encontrado: ${url}. Verifique se a URL da API está correta: ${this.baseURL}`;
      } else if (response.status === 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
      } else if (response.status === 503) {
        errorMessage = 'Serviço temporariamente indisponível. Tente novamente mais tarde.';
      }
      
      try {
        const errorData = await response.json();
        
        // Tenta diferentes formatos de mensagem de erro
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(', ');
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch {
        // Se não conseguir parsear JSON, usa a mensagem padrão
      }
      
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health/');
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async googleLogin(data: GoogleLoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login/google', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken(data: RefreshTokenData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/token/refresh', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(data: RefreshTokenData): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(accessToken: string): Promise<{ user: User; permissions: string[] }> {
    return this.request<{ user: User; permissions: string[] }>('/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async validateToken(data: ValidateTokenData): Promise<ValidateTokenResponse> {
    return this.request<ValidateTokenResponse>('/auth/token/introspect', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUsers(accessToken: string): Promise<{ users: User[] }> {
    return this.request<{ users: User[] }>('/auth/users', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async getUserById(accessToken: string, id: string): Promise<{ user: User; permissions: string[] }> {
    return this.request<{ user: User; permissions: string[] }>(`/auth/users/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

