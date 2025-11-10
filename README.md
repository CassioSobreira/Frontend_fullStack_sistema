# Frontend FullStack - Sistema de Autenticação (Vite + React)

Sistema de autenticação completo com integração ao backend, incluindo login, cadastro, gerenciamento de tokens e dashboards diferenciados por perfil.

## 🚀 Tecnologias

- **Vite** - Build tool e dev server
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **React Router** - Roteamento
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **GSAP** - Animações avançadas

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Backend rodando em `http://localhost:3000` (ou configurar variável de ambiente)

## 🔧 Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure a variável de ambiente (opcional):

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3000
```

Se não configurar, o sistema usará `http://localhost:3000` por padrão.

## 🏃 Executando o Projeto

### Desenvolvimento

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3001` (ou outra porta disponível).

### Build para Produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`.

### Preview da Build

```bash
npm run preview
```

## 📁 Estrutura do Projeto

```
├── src/
│   ├── components/          # Componentes React
│   │   ├── background/      # Componentes de fundo
│   │   └── shared/          # Componentes compartilhados
│   ├── contexts/            # Contextos React (Auth)
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilitários e serviços
│   │   ├── api.ts          # Cliente API
│   │   ├── auth.ts         # Serviço de autenticação
│   │   └── utils.ts        # Funções utilitárias
│   ├── pages/               # Páginas da aplicação
│   │   ├── Login.tsx
│   │   ├── Cadastro.tsx
│   │   ├── DashboardClient.tsx
│   │   └── DashboardAdmin.tsx
│   ├── App.tsx              # Componente principal com rotas
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globais
├── public/                  # Arquivos estáticos
├── index.html               # HTML principal
├── vite.config.ts           # Configuração do Vite
└── package.json
```

## 🔐 Endpoints Integrados

O projeto está integrado com os seguintes endpoints do backend:

- `POST /auth/register` - Cadastro de usuário
- `POST /auth/login` - Login local
- `POST /auth/google` - Login com Google (preparado)
- `POST /auth/refresh` - Atualizar sessão
- `POST /auth/logout` - Logout
- `GET /auth/me` - Obter perfil do usuário autenticado
- `POST /auth/validate` - Validar token
- `GET /auth/users` - Listar usuários (admin)
- `GET /auth/users/:id` - Obter usuário por ID

## 💡 Como Usar

### Login

1. Acesse a página inicial (`/`)
2. Digite seu email e senha
3. Clique em "Entrar"
4. Você será redirecionado automaticamente para o dashboard apropriado

### Cadastro

1. Acesse `/cadastro` ou clique em "Não possui uma conta? Cadastre-se"
2. Preencha todos os campos:
   - Nome
   - Email
   - Senha (mínimo 8 caracteres, com maiúsculas, minúsculas, números e caracteres especiais)
   - Confirmar Senha
   - Data de Nascimento
3. Clique em "Cadastrar"
4. Você será redirecionado automaticamente para o dashboard

### Validação de Senha

A senha deve atender aos seguintes critérios:
- Mínimo 8 caracteres
- Pelo menos uma letra maiúscula
- Pelo menos uma letra minúscula
- Pelo menos um número
- Pelo menos um caractere especial

### Gerenciamento de Sessão

O sistema gerencia automaticamente:
- **Access Token**: Expira em 15 minutos, renovado automaticamente
- **Refresh Token**: Expira em 30 dias, rotacionado a cada uso
- **Refresh automático**: O token é renovado 1 minuto antes da expiração

### Uso do Hook useAuth

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout, 
    hasPermission,
    isAdmin,
    isClient 
  } = useAuth();

  // Verificar se está autenticado
  if (!isAuthenticated) {
    return <div>Faça login</div>;
  }

  // Verificar permissão
  if (hasPermission('admin:users:read')) {
    // Mostrar funcionalidade
  }

  return <div>Bem-vindo, {user?.name}!</div>;
}
```

## 🎨 Componentes

O projeto utiliza:
- **Vite 6** - Build tool ultra-rápido
- **React 19** - Última versão do React
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Framework CSS utility-first
- **React Router 6** - Roteamento declarativo
- **Framer Motion** - Animações
- **GSAP** - Animações avançadas
- **Lucide React** - Ícones

## 🔒 Segurança

- Tokens armazenados no localStorage (considere usar httpOnly cookies em produção)
- Validação de senha no frontend e backend
- Refresh token rotacionado a cada uso
- Verificação automática de expiração de tokens
- Logout limpa todos os dados de autenticação

## 📝 Notas

- O sistema redireciona automaticamente usuários autenticados que tentam acessar páginas de login/cadastro
- Usuários não autenticados são redirecionados para a página de login ao tentar acessar dashboards
- Admins são redirecionados para `/dashboard/admin`
- Clientes são redirecionados para `/dashboard/client`

## 🐛 Troubleshooting

### Erro de CORS
Certifique-se de que o backend está configurado para aceitar requisições do frontend.

### Tokens não persistem
Verifique se o localStorage está habilitado no navegador.

### Erro ao fazer login
Verifique se o backend está rodando e acessível na URL configurada.

### Porta já em uso
O Vite tentará usar a porta 3001. Se estiver ocupada, ele perguntará se deseja usar outra porta.

## 📚 Documentação Adicional

Para mais detalhes sobre os endpoints, consulte a documentação do backend em `/docs/INTEGRATION.md` ou acesse `/api-docs` quando o servidor estiver rodando.

## 🆚 Diferenças do Next.js

Este projeto foi migrado de Next.js para Vite + React. Principais diferenças:

- **Roteamento**: React Router ao invés de file-based routing
- **Variáveis de ambiente**: `VITE_*` ao invés de `NEXT_PUBLIC_*`
- **Build**: Vite ao invés de Next.js build
- **Estrutura**: `src/` com páginas em `pages/` ao invés de `app/`
