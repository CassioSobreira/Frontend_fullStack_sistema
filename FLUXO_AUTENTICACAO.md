# 🔐 Fluxo de Autenticação e Redirecionamento

Este documento explica como funciona o cadastramento de usuários e o redirecionamento para os dashboards.

## 📋 Visão Geral

O sistema possui dois tipos de usuários:
- **Cliente (`client`)**: Usuário padrão do sistema
- **Administrador (`admin`)**: Usuário com permissões administrativas

## 🔄 Fluxo de Cadastro

### 1. Cadastro de Novo Usuário

Quando um usuário se cadastra através da página `/cadastro`:

1. **Preenchimento do Formulário**:
   - Nome (mínimo 2 caracteres)
   - Email (validado)
   - Senha (mínimo 8 caracteres, com maiúsculas, minúsculas, números e caracteres especiais)
   - Confirmar Senha (deve ser igual à senha)
   - Data de Nascimento (mínimo 13 anos)

2. **Validação Frontend**:
   - Validação de email com regex
   - Validação de senha conforme regras
   - Validação de data de nascimento (idade mínima)

3. **Requisição para o Backend**:
   ```typescript
   POST /auth/register
   {
     name: string,
     email: string,
     password: string,
     confirmPassword: string,
     dateOfBirth: string,
     role: 'client' // Sempre 'client' para novos cadastros
   }
   ```

4. **Resposta do Backend**:
   ```typescript
   {
     accessToken: string,
     refreshToken: string,
     user: {
       id: string,
       email: string,
       name: string,
       dateOfBirth: string,
       role: 'client' | 'admin',
       createdAt: string,
       updatedAt: string
     },
     permissions: string[]
   }
   ```

5. **Armazenamento Local**:
   - Tokens armazenados no `localStorage`
   - Dados do usuário armazenados no `localStorage`
   - Permissões armazenadas no `localStorage`

6. **Redirecionamento**:
   - O sistema verifica o `role` do usuário retornado pelo backend
   - Se `role === 'admin'` → redireciona para `/dashboard/admin`
   - Se `role === 'client'` → redireciona para `/dashboard/client`

### 2. Cadastro via Google OAuth

Quando um usuário faz login com Google:

1. **Autenticação Google**:
   - Usuário clica no botão "Entrar com Google"
   - Google exibe a tela de seleção de conta
   - Usuário autoriza o acesso

2. **Requisição para o Backend**:
   ```typescript
   POST /auth/login/google
   {
     idToken: string // Token do Google
   }
   ```

3. **Backend Processa**:
   - Valida o token do Google
   - Verifica se o usuário já existe (pelo email do Google)
   - Se não existir, cria um novo usuário com `role: 'client'`
   - Se existir, retorna o usuário existente (mantém o role original)

4. **Resposta e Redirecionamento**:
   - Mesmo fluxo do cadastro normal
   - Redireciona baseado no `role` do usuário

## 🎯 Decisão de Redirecionamento

### Como o Sistema Decide o Dashboard?

O sistema **NÃO permite** que usuários escolham seu próprio role durante o cadastro. A decisão é feita da seguinte forma:

1. **Novos Usuários**:
   - Sempre são criados com `role: 'client'`
   - Sempre são redirecionados para `/dashboard/client`

2. **Usuários Existentes**:
   - O role é definido no backend (provavelmente por um administrador)
   - O sistema redireciona baseado no role armazenado no banco de dados

3. **Lógica de Redirecionamento**:
   ```typescript
   // Função em src/lib/redirect.ts
   export function redirectToDashboard(user: User | null, navigate: NavigateFunction) {
     if (!user) {
       navigate('/');
       return;
     }
     
     if (user.role === 'admin') {
       navigate('/dashboard/admin');
     } else {
       navigate('/dashboard/client');
     }
   }
   ```

### Onde o Role é Definido?

- **Frontend**: Sempre envia `role: 'client'` durante o cadastro
- **Backend**: Pode modificar o role (ex: criar admin manualmente, ou através de lógica específica)
- **Banco de Dados**: Armazena o role definitivo do usuário

## 🔒 Proteção de Rotas

### Componente ProtectedRoute

O sistema usa o componente `ProtectedRoute` para proteger as rotas:

```typescript
// Rota protegida para clientes
<ProtectedRoute requireClient={true}>
  <ClientDashboard />
</ProtectedRoute>

// Rota protegida para administradores
<ProtectedRoute requireAdmin={true}>
  <AdminDashboard />
</ProtectedRoute>
```

### Comportamento do ProtectedRoute

1. **Verifica Autenticação**:
   - Se não estiver autenticado → redireciona para `/`
   - Se estiver autenticado → continua

2. **Verifica Permissões**:
   - Se `requireAdmin={true}` e usuário não é admin → redireciona para `/dashboard/client`
   - Se `requireClient={true}` e usuário é admin → redireciona para `/dashboard/admin`

3. **Renderiza o Componente**:
   - Se todas as verificações passarem → renderiza o componente filho

## 📍 Fluxo Completo

### Cenário 1: Novo Usuário (Cliente)

```
1. Usuário acessa /cadastro
2. Preenche formulário
3. Clica em "Cadastrar"
4. Frontend valida dados
5. Frontend envia POST /auth/register com role: 'client'
6. Backend cria usuário com role: 'client'
7. Backend retorna tokens e dados do usuário
8. Frontend armazena tokens e dados
9. Frontend verifica user.role === 'client'
10. Frontend redireciona para /dashboard/client
11. ProtectedRoute verifica autenticação e role
12. Renderiza ClientDashboard
```

### Cenário 2: Usuário Admin Faz Login

```
1. Usuário admin acessa /
2. Preenche email e senha
3. Clica em "Entrar"
4. Frontend envia POST /auth/login
5. Backend valida credenciais
6. Backend retorna tokens e dados do usuário (role: 'admin')
7. Frontend armazena tokens e dados
8. Frontend verifica user.role === 'admin'
9. Frontend redireciona para /dashboard/admin
10. ProtectedRoute verifica autenticação e role
11. Renderiza AdminDashboard
```

### Cenário 3: Cliente Tenta Acessar Dashboard Admin

```
1. Cliente autenticado tenta acessar /dashboard/admin
2. ProtectedRoute verifica requireAdmin={true}
3. ProtectedRoute verifica isAdmin === false
4. ProtectedRoute redireciona para /dashboard/client
5. ClientDashboard é renderizado
```

### Cenário 4: Admin Tenta Acessar Dashboard Cliente

```
1. Admin autenticado tenta acessar /dashboard/client
2. ProtectedRoute verifica requireClient={true}
3. ProtectedRoute verifica isClient === false (admin não é client)
4. ProtectedRoute redireciona para /dashboard/admin
5. AdminDashboard é renderizado
```

## 🔄 Atualização de Role

### Como Tornar um Usuário Admin?

O frontend **NÃO permite** que usuários se tornem admin durante o cadastro. Para tornar um usuário admin, você precisa:

1. **Via Backend**:
   - Modificar diretamente no banco de dados
   - Criar um endpoint administrativo (se existir)
   - Usar um script de migração

2. **Via Interface Admin** (se implementada):
   - Um admin existente pode promover outros usuários
   - Isso requer uma interface administrativa

### Após Mudança de Role

Quando o role de um usuário é alterado:

1. O usuário precisa fazer logout e login novamente
2. Ou o sistema pode invalidar o token e forçar novo login
3. Após novo login, o redirecionamento seguirá o novo role

## 📝 Resumo

- ✅ **Cadastro**: Sempre cria usuários com `role: 'client'`
- ✅ **Redirecionamento**: Baseado no `role` retornado pelo backend
- ✅ **Proteção**: Rotas protegidas verificam autenticação e role
- ✅ **Admin**: Role de admin é definido no backend, não no frontend
- ✅ **Segurança**: Clientes não podem acessar dashboard admin e vice-versa

## 🎯 Conclusão

O sistema é projetado para ser seguro e simples:
- Usuários comuns sempre começam como clientes
- Apenas administradores podem promover outros usuários (via backend)
- O frontend apenas respeita e redireciona baseado no role do backend
- Não há como um usuário se tornar admin através do frontend

