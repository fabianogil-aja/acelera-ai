# Guia de Segurança - Acelera AI

## Configuração de Segurança do Webhook N8N

O webhook do N8N agora requer autenticação via token para prevenir acessos não autorizados.

### Configurar Token na Vercel

1. Acesse o projeto na Vercel: https://vercel.com
2. Vá em **Settings** > **Environment Variables**
3. Adicione a nova variável:

**Key:** `N8N_WEBHOOK_TOKEN`
**Value:** `c6789eed-54d9-4dfc-a619-ac159446953b`

**Ambientes:** Production, Preview, Development

4. Faça **Redeploy** do projeto

### Configurar Token no N8N

No nó **HTTP Request** do N8N, adicione o header de autenticação:

1. Ative **Send Headers**
2. Adicione um novo header:
   - **Name:** `x-webhook-token`
   - **Value:** `c6789eed-54d9-4dfc-a619-ac159446953b`

### Testar o Webhook

```bash
# Com token (deve funcionar)
curl -X POST https://acelera-ai.vercel.app/api/webhook/n8n \
  -H "Content-Type: application/json" \
  -H "x-webhook-token: c6789eed-54d9-4dfc-a619-ac159446953b" \
  -d @test-webhook.example.json

# Sem token (deve retornar 401)
curl -X POST https://acelera-ai.vercel.app/api/webhook/n8n \
  -H "Content-Type: application/json" \
  -d @test-webhook.example.json
```

## Variáveis de Ambiente

### Obrigatórias

```env
# Google Sheets API
GOOGLE_SERVICE_ACCOUNT_EMAIL=seu-service-account@xxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=seu_sheet_id_aqui

# Slack Webhooks
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/xxx/xxx

# App
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app

# Webhook Security
N8N_WEBHOOK_TOKEN=seu-token-uuid-aqui
```

## Boas Práticas de Segurança

### 1. Nunca Commitar Credenciais

✅ **Permitido no Git:**
- `test-webhook.example.json` (dados fictícios)
- `package.json`, `tsconfig.json`
- Arquivos de configuração sem credenciais

❌ **NUNCA Commitar:**
- `.env.local` (credenciais reais)
- `test-webhook.json` (dados reais)
- Arquivos `*-credentials.json`
- Chaves privadas (`.key`, `.pem`)

### 2. Rotação de Tokens

- **Webhook Token:** Rotacionar a cada 90 dias
- **Google Service Account Key:** Rotacionar a cada 90 dias
- **Slack Webhook URL:** Rotacionar se comprometida

### 3. Monitoramento

Fique atento a:
- Tentativas de acesso sem token (logs: "Tentativa de acesso ao webhook sem token válido")
- Erros repetidos de autenticação
- Padrões incomuns de requisições

### 4. Logs Sanitizados

O sistema foi configurado para NÃO expor:
- Credenciais do Google Sheets
- URLs completas do Slack Webhook
- Stack traces completos em produção
- Mensagens de erro detalhadas

Em desenvolvimento, logs completos estão disponíveis para debugging.

## Checklist de Segurança

- [ ] `.env.local` não está no git
- [ ] `test-webhook.json` removido do git
- [ ] `N8N_WEBHOOK_TOKEN` configurado na Vercel
- [ ] Header `x-webhook-token` configurado no N8N
- [ ] Webhook testado e funcionando
- [ ] Logs de erro sanitizados
- [ ] Security headers configurados

## Reportar Vulnerabilidades

Se encontrar uma vulnerabilidade de segurança, **NÃO** crie uma issue pública.

Entre em contato diretamente com a equipe de TI da AJA.

---

**Última atualização:** 09 Janeiro 2026
