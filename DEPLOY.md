# 🚀 Guia de Deploy no Vercel

Este guia explica como fazer o deploy deste projeto frontend no Vercel.

## 📋 Pré-requisitos

1. Conta no [Vercel](https://vercel.com) (gratuita)
2. Conta no [GitHub](https://github.com), [GitLab](https://gitlab.com) ou [Bitbucket](https://bitbucket.org)
3. Backend deployado e acessível (URL da API)

## 🔧 Passo a Passo

### 1. Preparar o Repositório

Certifique-se de que seu código está em um repositório Git:

```bash
git init
git add .
git commit -m "Preparando para deploy"
git remote add origin <URL_DO_SEU_REPOSITORIO>
git push -u origin main
```

### 2. Configurar Variáveis de Ambiente no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **Add New Project**
3. Importe seu repositório
4. Na seção **Environment Variables**, adicione:

   - **VITE_API_URL**: URL do seu backend (ex: `https://api.seudominio.com`)
   - **VITE_GOOGLE_CLIENT_ID**: Client ID do Google OAuth (se estiver usando)

### 3. Configurar Google OAuth para Produção

Se você estiver usando Google OAuth:

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Vá em **APIs & Services** → **Credentials**
3. Edite seu OAuth 2.0 Client ID
4. Em **Authorized JavaScript origins**, adicione:
   - `https://seu-projeto.vercel.app`
   - `https://www.seu-projeto.vercel.app` (se usar www)
5. Em **Authorized redirect URIs**, adicione:
   - `https://seu-projeto.vercel.app`
   - `https://www.seu-projeto.vercel.app`

### 4. Deploy Automático

O Vercel detecta automaticamente que é um projeto Vite e configura:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

O arquivo `vercel.json` já está configurado com as opções corretas.

### 5. Verificar o Deploy

Após o deploy:

1. Acesse a URL fornecida pelo Vercel (ex: `https://seu-projeto.vercel.app`)
2. Teste o login e cadastro
3. Verifique se o redirecionamento funciona corretamente

## 🔄 Deploy Contínuo

O Vercel faz deploy automático sempre que você fizer push para o branch principal:

- **Branch principal** (main/master): Deploy em produção
- **Outros branches**: Deploy em preview (URL temporária)

## 🌍 Domínio Personalizado

Para usar um domínio personalizado:

1. Vá em **Project Settings** → **Domains**
2. Adicione seu domínio
3. Configure os registros DNS conforme instruções do Vercel

## 🔐 Variáveis de Ambiente

### Desenvolvimento

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

### Produção

Configure as variáveis no Vercel Dashboard:

1. Vá em **Project Settings** → **Environment Variables**
2. Adicione as variáveis para **Production**, **Preview** e **Development**
3. Use valores diferentes para cada ambiente se necessário

## 📝 Notas Importantes

- ⚠️ **Nunca commite arquivos `.env`** com credenciais reais
- 🔒 As variáveis de ambiente são injetadas no build time
- 🌐 Certifique-se de que o backend aceita requisições do domínio do Vercel (CORS)
- 🔄 O Vercel faz cache dos builds. Para forçar um novo build, faça um novo commit

## 🐛 Troubleshooting

### Build Falha

- Verifique se todas as dependências estão no `package.json`
- Verifique os logs de build no Vercel Dashboard
- Teste o build localmente: `npm run build`

### Erro de CORS

- Configure o backend para aceitar requisições do domínio do Vercel
- Adicione o domínio do Vercel nas configurações de CORS do backend

### Variáveis de Ambiente Não Funcionam

- Verifique se o nome da variável começa com `VITE_`
- Verifique se as variáveis estão configuradas no Vercel Dashboard
- Faça um novo deploy após adicionar variáveis

### Página em Branco

- Verifique o console do navegador para erros
- Verifique se a API está acessível
- Verifique os logs do Vercel

## 📚 Referências

- [Documentação do Vercel](https://vercel.com/docs)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [React Router Deployment](https://reactrouter.com/en/main/start/overview#deploying)

