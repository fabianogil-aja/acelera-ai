// Envio de notificações para o Slack via Webhook

interface SlackMessage {
  text: string
  blocks?: SlackBlock[]
}

interface SlackBlock {
  type: string
  text?: {
    type: string
    text: string
    emoji?: boolean
  }
  elements?: Array<{
    type: string
    text?: {
      type: string
      text: string
    }
    url?: string
  }>
}

// Envia uma mensagem simples para o Slack
export async function enviarMensagemSlack(texto: string): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    console.error('SLACK_WEBHOOK_URL não configurada')
    return false
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: texto }),
    })

    return response.ok
  } catch (error) {
    console.error('Erro ao enviar mensagem para o Slack:', error)
    return false
  }
}

// Envia um alerta de prazo de report
export async function enviarAlertaPrazoReport(
  assistenteTitulo: string,
  criadorNome: string,
  criadorEmail: string,
  diasRestantes: number
): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    console.error('SLACK_WEBHOOK_URL não configurada')
    return false
  }

  const urgencia = diasRestantes <= 1 ? '🚨' : diasRestantes <= 3 ? '⚠️' : '📢'

  const message: SlackMessage = {
    text: `${urgencia} Alerta de prazo - ${assistenteTitulo}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${urgencia} Alerta de Prazo de Report`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Assistente:* ${assistenteTitulo}\n*Criador:* ${criadorNome} (<@${criadorEmail}>)\n*Prazo:* ${diasRestantes} dia(s) restante(s)`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Por favor, envie o report de impacto do seu assistente para garantir o bônus de R$35,00.`,
        },
      },
    ],
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    return response.ok
  } catch (error) {
    console.error('Erro ao enviar alerta para o Slack:', error)
    return false
  }
}

// Envia notificação de aprovação
export async function enviarNotificacaoAprovacao(
  assistenteTitulo: string,
  criadorNome: string,
  criadorEmail: string
): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    console.error('SLACK_WEBHOOK_URL não configurada')
    return false
  }

  const message: SlackMessage = {
    text: `✅ Assistente aprovado - ${assistenteTitulo}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '✅ Assistente Aprovado!',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Assistente:* ${assistenteTitulo}\n*Criador:* ${criadorNome} (<@${criadorEmail}>)\n*Crédito:* R$15,00`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🎉 Parabéns! Você tem *15 dias* para enviar o report de impacto e ganhar mais R$35,00.`,
        },
      },
    ],
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    return response.ok
  } catch (error) {
    console.error('Erro ao enviar notificação para o Slack:', error)
    return false
  }
}

// Envia notificação de reprovação
export async function enviarNotificacaoReprovacao(
  assistenteTitulo: string,
  criadorNome: string,
  criadorEmail: string,
  motivo?: string
): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    console.error('SLACK_WEBHOOK_URL não configurada')
    return false
  }

  const message: SlackMessage = {
    text: `❌ Assistente reprovado - ${assistenteTitulo}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '❌ Assistente Reprovado',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Assistente:* ${assistenteTitulo}\n*Criador:* ${criadorNome} (<@${criadorEmail}>)${motivo ? `\n*Motivo:* ${motivo}` : ''}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Por favor, verifique os requisitos e tente novamente.`,
        },
      },
    ],
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    return response.ok
  } catch (error) {
    console.error('Erro ao enviar notificação para o Slack:', error)
    return false
  }
}

// Envia notificação de report recebido
export async function enviarNotificacaoReportRecebido(
  assistenteTitulo: string,
  criadorNome: string,
  creditoReport: number
): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    console.error('SLACK_WEBHOOK_URL não configurada')
    return false
  }

  const dentroPrazo = creditoReport > 0

  const message: SlackMessage = {
    text: `📊 Report recebido - ${assistenteTitulo}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📊 Report de Impacto Recebido',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Assistente:* ${assistenteTitulo}\n*Criador:* ${criadorNome}\n*Crédito Report:* ${dentroPrazo ? `R$${creditoReport},00 ✅` : 'R$0,00 (fora do prazo)'}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: dentroPrazo
            ? `🎉 Report enviado dentro do prazo! Crédito total: R$50,00`
            : `⚠️ Report enviado fora do prazo. Crédito total: R$15,00`,
        },
      },
    ],
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    return response.ok
  } catch (error) {
    console.error('Erro ao enviar notificação para o Slack:', error)
    return false
  }
}

// Envia notificação genérica via webhook (usado pela API webhook/n8n)
interface NotificacaoSlackParams {
  tipo: 'NOVA_SUBMISSAO' | 'APROVACAO' | 'REPROVACAO' | 'REPORT'
  assistente: {
    titulo: string
    criador_nome: string
    link_gem?: string
  }
  motivo?: string
}

export async function enviarNotificacaoSlack(
  params: NotificacaoSlackParams
): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    console.error('SLACK_WEBHOOK_URL não configurada')
    return false
  }

  let message: SlackMessage

  switch (params.tipo) {
    case 'NOVA_SUBMISSAO':
      message = {
        text: `🆕 Nova submissão - ${params.assistente.titulo}`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🆕 Nova Submissão de Assistente',
              emoji: true,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Assistente:* ${params.assistente.titulo}\n*Criador:* ${params.assistente.criador_nome}\n*Link:* ${params.assistente.link_gem || 'N/A'}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `📋 Aguardando aprovação da equipe Acelera AI.`,
            },
          },
        ],
      }
      break

    default:
      message = {
        text: `Notificação: ${params.assistente.titulo}`,
      }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    return response.ok
  } catch (error) {
    console.error('Erro ao enviar notificação para o Slack:', error)
    return false
  }
}
