const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`;
      
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
    return this.request<{ status: string }>('/health');
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
    return this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken(data: RefreshTokenData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/refresh', {
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
    return this.request<ValidateTokenResponse>('/auth/validate', {
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

