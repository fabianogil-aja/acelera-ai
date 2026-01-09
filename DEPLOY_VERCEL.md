# Deploy Rápido na Vercel

Guia passo a passo para fazer deploy do Acelera AI na Vercel.

---

## Pré-requisitos

- Conta no GitHub
- Conta na Vercel (https://vercel.com)
- Código do projeto no GitHub

---

## Passo 1: Preparar o Projeto

### 1.1 Criar .gitignore

Verifique se o `.gitignore` tem:

```
.env.local
.env*.local
node_modules/
.next/
```

### 1.2 Criar repositório no GitHub

```bash
# Inicializar git (se ainda não tem)
git init

# Adicionar arquivos
git add .

# Commit
git commit -m "feat: setup inicial do projeto"

# Criar repositório no GitHub e adicionar remote
git remote add origin https://github.com/SEU_USUARIO/acelera-ai.git

# Push
git push -u origin main
```

---

## Passo 2: Deploy na Vercel

### Via Dashboard (Recomendado)

1. Acesse: https://vercel.com/new
2. Clique em "Import Git Repository"
3. Selecione seu repositório `acelera-ai`
4. Configure o projeto:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
5. Clique em "Deploy"

### Via CLI (Alternativa)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Seguir as instruções
```

---

## Passo 3: Configurar Variáveis de Ambiente

### 3.1 Acessar Settings

1. Na dashboard da Vercel, abra seu projeto
2. Vá em **Settings** > **Environment Variables**

### 3.2 Adicionar Variáveis

Adicione as seguintes variáveis (valores do seu `.env.local`):

| Nome da Variável | Valor |
|------------------|-------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `acelera-ai-sheets@n8n-417915.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | Cole a private key completa (com `\n`) |
| `GOOGLE_SHEET_ID` | `1d2yq6Irtzg2cbrjoEvfxzyOJvgTNSH-pKYI1gzrBB_k` |
| `SLACK_WEBHOOK_URL` | Sua URL do Slack webhook |
| `NEXT_PUBLIC_APP_URL` | `https://seu-projeto.vercel.app` |

**⚠️ IMPORTANTE:**
- Ao colar a `GOOGLE_PRIVATE_KEY`, mantenha as aspas e os `\n`
- Exemplo: `"-----BEGIN PRIVATE KEY-----\nMII...`

### 3.3 Selecionar Ambientes

Para cada variável, selecione:
- ✅ Production
- ✅ Preview
- ✅ Development

---

## Passo 4: Redeploy

Após adicionar as variáveis:

1. Vá em **Deployments**
2. Clique nos 3 pontinhos do último deploy
3. Clique em **Redeploy**
4. Aguarde o build finalizar

---

## Passo 5: Testar a URL

### 5.1 Copiar URL de Produção

A Vercel gera algo como:
```
https://acelera-ai.vercel.app
```

### 5.2 Testar o Webhook

```bash
curl -X POST https://acelera-ai.vercel.app/api/webhook/n8n \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Teste Deploy",
    "link": "https://gemini.google.com/gem/teste",
    "criador_nome": "Teste User",
    "criador_setor": "TI",
    "problema_que_resolve": "Teste",
    "o_que_faz": "Teste",
    "como_usar": "Teste",
    "complexidade": "BAIXA"
  }'
```

### 5.3 Verificar Dashboard

Acesse:
```
https://acelera-ai.vercel.app
```

---

## Passo 6: Configurar no N8N

No seu workflow n8n:

1. Abra o nó **HTTP Request**
2. Atualize a URL para:
   ```
   https://acelera-ai.vercel.app/api/webhook/n8n
   ```
3. Salve e teste!

---

## Bonus: Deploy Automático

Após o setup inicial, cada push para `main` faz deploy automático:

```bash
# Fazer alterações
git add .
git commit -m "feat: nova funcionalidade"
git push

# Vercel detecta e faz deploy automaticamente
```

---

## Troubleshooting

### Erro: "Function exceeded timeout"

Na Vercel, Edge Functions têm limite de 10s (free tier).

**Solução:**
1. Vá em Settings > Functions
2. Aumente o timeout (se tier pago)
3. Ou otimize o código para ser mais rápido

### Erro: "Google Sheets API authentication failed"

**Solução:**
1. Verifique se a `GOOGLE_PRIVATE_KEY` foi colada corretamente
2. Mantenha os `\n` e as aspas
3. Confirme que a planilha está compartilhada com a service account

### Erro 404 no webhook

**Solução:**
1. Confirme que a rota existe: `/api/webhook/n8n/route.ts`
2. Verifique se o build foi bem-sucedido
3. Teste a URL base primeiro: `https://seu-projeto.vercel.app`

### Build failed

**Soluções:**
1. Verifique erros de TypeScript localmente: `npm run build`
2. Corrija imports e tipos
3. Push novamente

---

## Monitoramento

### Ver Logs

1. Na dashboard da Vercel, vá em **Deployments**
2. Clique no deployment ativo
3. Vá em **Functions** > **Runtime Logs**

### Métricas

Veja métricas de:
- Requests por segundo
- Tempo de resposta
- Erros

---

## Domínio Customizado (Opcional)

1. Vá em Settings > Domains
2. Adicione seu domínio customizado
3. Configure DNS conforme instruções
4. Aguarde propagação (pode levar até 48h)

---

## URLs Finais

Após deploy, suas URLs serão:

| Recurso | URL |
|---------|-----|
| Dashboard | `https://seu-projeto.vercel.app` |
| Webhook N8N | `https://seu-projeto.vercel.app/api/webhook/n8n` |
| API Assistentes | `https://seu-projeto.vercel.app/api/assistentes` |
| API Métricas | `https://seu-projeto.vercel.app/api/metricas` |

---

**Última atualização:** 09 Janeiro 2026
