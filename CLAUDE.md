# CLAUDE.md - Contexto do Projeto

## REGRAS DE COMMIT

Sempre que eu pedir para fazer commit, siga este processo obrigatório:

### 1. Antes do commit:
- Atualize a VERSÃO em `package.json` (incrementar alpha.X)
- Atualize o CLAUDE.md com resumo das alterações feitas nesta sessão

### 2. Mensagem de commit:
Use o padrão conventional commits:
- feat: nova funcionalidade
- fix: correção de bug
- style: mudanças visuais
- refactor: refatoração
- docs: documentação

### 3. Executar:
```bash
git add .
git commit -m "tipo: descrição clara"
git push
```

---

## Sobre o Projeto

**Nome:** Acelera AI - Sistema de Gestão
**Versão:** 1.0.0-alpha.1
**Status:** MVP em desenvolvimento (Alpha)

### Resumo
Sistema interno para gerenciar o programa Acelera AI, que incentiva colaboradores da AJA a criarem assistentes de IA (Gems no Google) para automatizar tarefas repetitivas. O sistema resolve o problema de rastreabilidade e gestão de bonificações.

**Funcionalidades:**
- Cadastro automático (via n8n) e manual de assistentes
- Fluxo de aprovação (R$15 crédito ao aprovar)
- Controle de bonificação (R$35 report em até 15 dias)
- Alertas de cobrança de feedback
- Dashboard de acompanhamento
- Relatório semanal para pagamento
- Notificações no Slack

---

## Stack Tecnológica

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| Framework | Next.js (App Router) | 15.x |
| Linguagem | TypeScript | 5.x |
| UI Library | React | 19.x |
| Estilização | Tailwind CSS | 4.x |
| Componentes | shadcn/ui + Radix UI | - |
| Formulários | React Hook Form + Zod | 7.x / 4.x |
| Gráficos | Recharts | 2.x |
| Ícones | Lucide React | 0.x |
| Banco de Dados | Google Sheets API | - |
| Notificações | Slack Webhooks | - |

---

## Estrutura do Projeto

```
acelera-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Dashboard
│   │   ├── layout.tsx               # Layout com sidebar
│   │   ├── assistentes/
│   │   │   ├── page.tsx             # Lista de assistentes
│   │   │   ├── [id]/page.tsx        # Detalhe do assistente
│   │   │   └── novo/page.tsx        # Cadastro manual
│   │   ├── relatorios/page.tsx      # Relatório de pagamentos
│   │   ├── inbox/page.tsx           # Alertas e notificações
│   │   └── api/
│   │       ├── assistentes/
│   │       │   ├── route.ts         # GET (lista) e POST (criar)
│   │       │   └── [id]/
│   │       │       ├── route.ts     # GET detalhe
│   │       │       ├── aprovar/route.ts
│   │       │       ├── reprovar/route.ts
│   │       │       └── report/route.ts
│   │       ├── relatorio/route.ts
│   │       ├── metricas/route.ts
│   │       └── alertas/route.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── badge-pendencias.tsx
│   │   ├── dashboard/
│   │   │   ├── cards-metricas.tsx
│   │   │   ├── grafico-status.tsx
│   │   │   ├── grafico-criacoes.tsx
│   │   │   ├── tabela-pendencias.tsx
│   │   │   └── ranking-criadores.tsx
│   │   ├── assistentes/
│   │   │   ├── tabela-assistentes.tsx
│   │   │   ├── filtros-assistentes.tsx
│   │   │   ├── form-cadastro.tsx
│   │   │   └── timeline-eventos.tsx
│   │   └── ui/                      # shadcn components
│   ├── lib/
│   │   ├── google-sheets.ts         # Conexão e CRUD do Sheets
│   │   ├── slack.ts                 # Envio de notificações
│   │   ├── utils.ts                 # Helpers
│   │   └── types.ts                 # TypeScript types
│   └── config/
│       └── constants.ts             # Valores de bonificação, prazos, etc.
```

---

## Modelo de Dados

### Assistente
```typescript
{
  id, titulo, link_gem,
  criador_nome, criador_email, criador_setor,
  data_criacao, data_aprovacao, data_report, data_limite_report,
  status, problema_resolvido, o_que_faz, como_usar, complexidade,
  report_resultado, report_melhoria, report_aprendizados,
  credito_criacao, credito_report, credito_total,
  notificacao_enviada_7d, notificacao_enviada_3d, notificacao_enviada_1d
}
```

### Status de Assistente
`PENDENTE | APROVADO | AGUARDANDO_REPORT | CONCLUIDO | EXPIRADO | REPROVADO`

### Regras de Negócio
- **Crédito de criação:** R$15 ao aprovar
- **Crédito de report:** R$35 se report em até 15 dias
- **Status flow:** PENDENTE → APROVADO → AGUARDANDO_REPORT → CONCLUÍDO/EXPIRADO
- **Alertas:** 7, 3 e 1 dia antes do prazo

---

## Comandos

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Lint
npm run lint
```

---

## Configuração

### Variáveis de Ambiente (.env.local)

```env
# Google Sheets API
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=seu_sheet_id_aqui

# Slack Webhooks
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/xxx/xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/google-sheets.ts` | CRUD e conexão com Google Sheets |
| `src/lib/slack.ts` | Envio de notificações |
| `src/lib/types.ts` | Todas as definições de tipos |
| `src/config/constants.ts` | Valores e configurações |
| `src/app/layout.tsx` | Layout raiz com providers |
| `src/components/layout/sidebar.tsx` | Navegação principal |

---

## Histórico de Alterações

### Sessão 09/01/2026 (v1.0.0-alpha.1)

**Setup Inicial do Projeto:**
- Criado projeto Next.js 15 com App Router
- Configurado Tailwind CSS 4 e shadcn/ui
- Instaladas dependências (google-spreadsheet, date-fns, recharts, etc.)

**Estrutura Base:**
- Criados tipos TypeScript completos (`src/lib/types.ts`)
- Configuradas constantes do sistema (`src/config/constants.ts`)
- Implementada conexão com Google Sheets (`src/lib/google-sheets.ts`)
- Implementada integração com Slack (`src/lib/slack.ts`)

**API Routes:**
- GET/POST `/api/assistentes` - Listagem e criação
- GET `/api/assistentes/[id]` - Detalhe
- POST `/api/assistentes/[id]/aprovar` - Aprovação com crédito
- POST `/api/assistentes/[id]/reprovar` - Reprovação
- POST `/api/assistentes/[id]/report` - Registro de report
- GET `/api/metricas` - Métricas do dashboard
- GET `/api/relatorio` - Relatório por período
- GET `/api/alertas` - Alertas e pendências

**Layout:**
- Sidebar colapsável com navegação
- Header com badge de pendências
- Layout responsivo

**Páginas:**
- Dashboard com cards, gráficos e tabela de pendências
- Listagem de assistentes com filtros e ações
- Cadastro manual de assistentes
- Detalhe do assistente com timeline
- Relatórios com exportação CSV
- Inbox de alertas e notificações

**Componentes:**
- CardsMetricas, GraficoStatus, GraficoCriacoes
- TabelaAssistentes, FiltrosAssistentes
- FormCadastro, TimelineEventos
- TabelaPendencias, RankingCriadores

---

*Última atualização: 09 Janeiro 2026*
