# Como Expor o Webhook para o N8N Cloud

O n8n cloud não consegue acessar `localhost:3000`. Você precisa expor sua aplicação local ou fazer deploy em produção.

---

## Opção 1: ngrok (Recomendado para Testes)

### Passo 1: Instalar ngrok

```bash
brew install ngrok
```

Ou baixe em: https://ngrok.com/download

### Passo 2: Criar conta no ngrok (opcional)

1. Acesse: https://dashboard.ngrok.com/signup
2. Pegue seu auth token
3. Configure:

```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

### Passo 3: Expor o servidor

Com o servidor Next.js rodando (`npm run dev`), abra um novo terminal:

```bash
ngrok http 3000
```

### Passo 4: Copiar a URL pública

O ngrok vai mostrar algo assim:

```
Forwarding   https://abc123.ngrok.io -> http://localhost:3000
```

Use esta URL no n8n:
```
https://abc123.ngrok.io/api/webhook/n8n
```

**Observação:** A URL muda toda vez que você reinicia o ngrok (versão free).

---

## Opção 2: Cloudflare Tunnel (Grátis e Persistente)

### Passo 1: Instalar cloudflared

```bash
brew install cloudflare/cloudflare/cloudflared
```

Ou baixe em: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

### Passo 2: Expor o servidor

```bash
cloudflared tunnel --url http://localhost:3000
```

O Cloudflare vai gerar uma URL pública:
```
https://xyz.trycloudflare.com
```

Use no n8n:
```
https://xyz.trycloudflare.com/api/webhook/n8n
```

---

## Opção 3: Deploy em Produção (Recomendado)

### Deploy na Vercel (Grátis e Fácil)

#### Passo 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

#### Passo 2: Login

```bash
vercel login
```

#### Passo 3: Deploy

```bash
vercel
```

Siga as instruções e copie a URL de produção.

#### Passo 4: Configurar variáveis de ambiente

Na dashboard da Vercel:
1. Acesse o projeto
2. Vá em Settings > Environment Variables
3. Adicione as variáveis do `.env.local`:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_SHEET_ID`
   - `SLACK_WEBHOOK_URL`
   - `NEXT_PUBLIC_APP_URL`

#### Passo 5: Usar a URL no n8n

```
https://seu-projeto.vercel.app/api/webhook/n8n
```

---

## Opção 4: Railway (Alternativa ao Vercel)

### Passo 1: Criar conta

Acesse: https://railway.app

### Passo 2: Criar novo projeto

1. Clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Conecte seu repositório

### Passo 3: Configurar variáveis

Adicione as variáveis de ambiente no painel do Railway.

### Passo 4: Obter URL

Railway gera automaticamente uma URL:
```
https://seu-projeto.up.railway.app/api/webhook/n8n
```

---

## Comparação das Opções

| Opção | Prós | Contras | Custo |
|-------|------|---------|-------|
| **ngrok** | Rápido, fácil | URL muda toda vez | Grátis (limitado) |
| **Cloudflare Tunnel** | Grátis, confiável | URL muda toda vez (free) | Grátis |
| **Vercel** | Produção, rápido, CI/CD | Requer deploy | Grátis (hobby) |
| **Railway** | Produção, fácil | Menos features que Vercel | Grátis ($5 crédito) |

---

## Minha Recomendação

### Para Desenvolvimento/Testes:
Use **ngrok** ou **Cloudflare Tunnel**

### Para Produção:
Use **Vercel** (melhor para Next.js)

---

## Testando o Webhook Público

Depois de expor com ngrok/cloudflare/vercel:

```bash
curl -X POST https://SUA_URL_PUBLICA/api/webhook/n8n \
  -H "Content-Type: application/json" \
  -d @test-webhook.json
```

---

## Configurando no N8N Cloud

1. Abra seu workflow no n8n
2. Adicione um nó **HTTP Request**
3. Configure:
   - Method: `POST`
   - URL: `https://SUA_URL_PUBLICA/api/webhook/n8n`
   - Body Content Type: `JSON`
   - Body: Cole o JSON do assistente
4. Execute e teste!

---

## Troubleshooting

### Erro: "Could not connect"
- Verifique se o servidor Next.js está rodando
- Confirme que o tunnel (ngrok/cloudflare) está ativo
- Teste a URL no navegador primeiro

### Erro 500 no webhook
- Verifique as credenciais do Google Sheets
- Confirme que a planilha está compartilhada
- Veja os logs do servidor

### Vercel: "Function exceeded timeout"
- Aumente o timeout nas configurações da Vercel
- Otimize as chamadas ao Google Sheets API

---

**Última atualização:** 09 Janeiro 2026
