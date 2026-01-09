# Webhook N8N - Cadastro Automático de Assistentes

## Endpoint

```
POST http://localhost:3000/api/webhook/n8n
```

**Produção:** Substitua `localhost:3000` pela URL do seu servidor.

---

## Formato do JSON

O webhook aceita um **objeto único** ou um **array de objetos** com o seguinte formato:

### Campos Obrigatórios

| Campo | Tipo | Valores | Descrição |
|-------|------|---------|-----------|
| `titulo` | string | - | Título do assistente |
| `link` | string | URL | Link do Gem no Google |
| `criador_nome` | string | - | Nome completo do criador |
| `criador_setor` | string | - | Setor do criador (ex: "Customer Success") |
| `problema_que_resolve` | string | - | Descrição do problema resolvido |
| `o_que_faz` | string | - | Explicação do que o assistente faz |
| `como_usar` | string | - | Instruções de uso |
| `complexidade` | string | `BAIXA`, `MEDIA`, `ALTA` | Nível de complexidade |

### Campos Opcionais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `criador_email` | string | Email do criador. Se não informado, será gerado automaticamente |
| `data_criacao` | string | Data ISO. Se não informado, usa data atual |

---

## Exemplos de Uso

### Exemplo 1: Objeto Único

```json
{
  "titulo": "Acelera CS - Diagnóstico & Follow-up",
  "link": "https://gemini.google.com/gem/1NR6NhU7ccbpGKN_Qu77dPGkM9w7rj7jN",
  "criador_nome": "Beatriz Nunes",
  "criador_email": "beatriz.nunes@aja.com.br",
  "criador_setor": "Customer Success",
  "data_criacao": "2025-01-08",
  "problema_que_resolve": "Alunos perguntam todo dia onde achar a segunda via do boleto. São ~30 tickets/dia só com isso. Time gasta 2h respondendo a mesma coisa.",
  "o_que_faz": "Transforma as calls de mentoria em registros executivos para o Zoho CRM e sequências de engajamento para o WhatsApp.",
  "como_usar": "Sempre que você terminar uma call, basta colar a transcrição/resumo do Gemini e dizer: 'Gere o diagnóstico da call de hoje' + anexo ou cópia do Gemini da reunião",
  "complexidade": "BAIXA"
}
```

### Exemplo 2: Array de Objetos (Múltiplas Submissões)

```json
[
  {
    "titulo": "Assistente 1",
    "link": "https://gemini.google.com/gem/xxx",
    "criador_nome": "João Silva",
    "criador_setor": "Vendas",
    "problema_que_resolve": "Problema X",
    "o_que_faz": "Solução Y",
    "como_usar": "Passo a passo Z",
    "complexidade": "MEDIA"
  },
  {
    "titulo": "Assistente 2",
    "link": "https://gemini.google.com/gem/yyy",
    "criador_nome": "Maria Santos",
    "criador_setor": "Marketing",
    "problema_que_resolve": "Problema A",
    "o_que_faz": "Solução B",
    "como_usar": "Passo a passo C",
    "complexidade": "ALTA"
  }
]
```

---

## Respostas da API

### Sucesso (201 Created)

```json
{
  "success": true,
  "message": "1 assistente(s) criado(s) com sucesso",
  "assistentes": [
    {
      "id": "uuid-gerado-automaticamente",
      "titulo": "Acelera CS - Diagnóstico & Follow-up",
      "status": "PENDENTE"
    }
  ]
}
```

### Erro - Campos Faltando (400 Bad Request)

```json
{
  "error": "Campos obrigatórios faltando",
  "required": [
    "titulo",
    "link",
    "criador_nome",
    "criador_setor",
    "problema_que_resolve",
    "o_que_faz",
    "como_usar",
    "complexidade"
  ]
}
```

### Erro - Complexidade Inválida (400 Bad Request)

```json
{
  "error": "Complexidade inválida",
  "allowed": ["BAIXA", "MEDIA", "ALTA"]
}
```

### Erro Interno (500 Internal Server Error)

```json
{
  "error": "Erro ao processar webhook",
  "details": "Mensagem de erro detalhada"
}
```

---

## Configuração no N8N

### 1. Adicione um nó HTTP Request

- **Method:** POST
- **URL:** `http://localhost:3000/api/webhook/n8n`
- **Authentication:** None (ou configure se necessário)
- **Body Content Type:** JSON
- **Specify Body:** Using Fields Below

### 2. Configure os campos do JSON

Use os **Expression** do n8n para mapear os dados:

```javascript
{
  "titulo": "{{ $json.titulo }}",
  "link": "{{ $json.link }}",
  "criador_nome": "{{ $json.criador_nome }}",
  "criador_email": "{{ $json.criador_email }}",
  "criador_setor": "{{ $json.criador_setor }}",
  "data_criacao": "{{ $json.data_criacao }}",
  "problema_que_resolve": "{{ $json.problema_que_resolve }}",
  "o_que_faz": "{{ $json.o_que_faz }}",
  "como_usar": "{{ $json.como_usar }}",
  "complexidade": "{{ $json.complexidade }}"
}
```

### 3. Teste o Webhook

Execute o workflow no n8n e verifique se o assistente foi criado no sistema.

---

## Notificações no Slack

Quando um assistente é criado via webhook, o sistema automaticamente:

1. ✅ Cria o registro na planilha do Google Sheets
2. ✅ Define o status como `PENDENTE`
3. ✅ Envia notificação no Slack (se configurado)

**Observação:** Se o Slack não estiver configurado, o cadastro continua normalmente sem enviar notificação.

---

## Fluxo Completo

```
1. Usuário posta no Slack
   ↓
2. N8N captura mensagem
   ↓
3. Agente IA extrai informações
   ↓
4. N8N envia para webhook
   ↓
5. Sistema cria assistente
   ↓
6. Notificação no Slack
   ↓
7. Aguarda aprovação manual
```

---

## Testando Localmente

### Via cURL

```bash
curl -X POST http://localhost:3000/api/webhook/n8n \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Teste Webhook",
    "link": "https://gemini.google.com/gem/teste",
    "criador_nome": "Teste User",
    "criador_setor": "TI",
    "problema_que_resolve": "Teste",
    "o_que_faz": "Teste",
    "como_usar": "Teste",
    "complexidade": "BAIXA"
  }'
```

### Via Postman/Insomnia

1. Method: POST
2. URL: `http://localhost:3000/api/webhook/n8n`
3. Headers: `Content-Type: application/json`
4. Body: (cole o JSON de exemplo)

---

## Segurança (Recomendações)

Para produção, considere adicionar:

1. **API Key:** Validar token no header
2. **Rate Limiting:** Limitar requisições por IP
3. **HTTPS:** Usar sempre HTTPS em produção
4. **Validação Extra:** Validar domínio do link do Gem

---

## Troubleshooting

### Erro 400 - Bad Request
- Verifique se todos os campos obrigatórios estão presentes
- Confirme que `complexidade` é `BAIXA`, `MEDIA` ou `ALTA`

### Erro 500 - Internal Server Error
- Verifique as credenciais do Google Sheets no `.env.local`
- Confirme que a planilha está compartilhada com a service account
- Veja os logs do servidor para detalhes

### Notificação Slack não enviada
- Verifique se `SLACK_WEBHOOK_URL` está configurada no `.env.local`
- Confirme que o webhook URL do Slack está ativo
- Veja os logs: "Erro ao enviar notificação Slack"

---

**Última atualização:** 09 Janeiro 2026
