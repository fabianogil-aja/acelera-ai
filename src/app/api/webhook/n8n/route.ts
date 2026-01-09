import { NextRequest, NextResponse } from 'next/server'
import { criarAssistente } from '@/lib/google-sheets'
import { enviarNotificacaoSlack } from '@/lib/slack'

// Schema do JSON esperado do n8n
interface N8nWebhookPayload {
  titulo: string
  link: string
  criador_nome: string
  criador_setor: string
  data_criacao: string
  problema_que_resolve: string
  o_que_faz: string
  como_usar: string
  complexidade: 'BAIXA' | 'MEDIA' | 'ALTA'
  criador_email?: string // Opcional, caso venha do n8n
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valida se é array ou objeto único
    const payloads: N8nWebhookPayload[] = Array.isArray(body) ? body : [body]

    const resultados = []

    for (const payload of payloads) {
      // Validação básica dos campos obrigatórios
      if (
        !payload.titulo ||
        !payload.link ||
        !payload.criador_nome ||
        !payload.criador_setor ||
        !payload.problema_que_resolve ||
        !payload.o_que_faz ||
        !payload.como_usar ||
        !payload.complexidade
      ) {
        return NextResponse.json(
          {
            error: 'Campos obrigatórios faltando',
            required: [
              'titulo',
              'link',
              'criador_nome',
              'criador_setor',
              'problema_que_resolve',
              'o_que_faz',
              'como_usar',
              'complexidade',
            ],
          },
          { status: 400 }
        )
      }

      // Normaliza complexidade para uppercase
      const complexidade = payload.complexidade.toUpperCase() as
        | 'BAIXA'
        | 'MEDIA'
        | 'ALTA'

      // Valida complexidade
      if (!['BAIXA', 'MEDIA', 'ALTA'].includes(complexidade)) {
        return NextResponse.json(
          {
            error: 'Complexidade inválida',
            allowed: ['BAIXA', 'MEDIA', 'ALTA'],
          },
          { status: 400 }
        )
      }

      // Gera email caso não venha do n8n
      const criadorEmail =
        payload.criador_email ||
        `${payload.criador_nome.toLowerCase().replace(/\s+/g, '.')}@aja.com.br`

      // Cria o assistente
      const assistente = await criarAssistente({
        titulo: payload.titulo,
        link_gem: payload.link,
        criador_nome: payload.criador_nome,
        criador_email: criadorEmail,
        criador_setor: payload.criador_setor,
        data_criacao: payload.data_criacao || new Date().toISOString(),
        problema_resolvido: payload.problema_que_resolve,
        o_que_faz: payload.o_que_faz,
        como_usar: payload.como_usar,
        complexidade: complexidade,
      })

      // Envia notificação no Slack
      try {
        await enviarNotificacaoSlack({
          tipo: 'NOVA_SUBMISSAO',
          assistente: {
            titulo: assistente.titulo,
            criador_nome: assistente.criador_nome,
            link_gem: assistente.link_gem,
          },
        })
      } catch (slackError) {
        // Não quebra se o Slack falhar
        console.error('Erro ao enviar notificação Slack:', slackError)
      }

      resultados.push({
        id: assistente.id,
        titulo: assistente.titulo,
        status: assistente.status,
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: `${resultados.length} assistente(s) criado(s) com sucesso`,
        assistentes: resultados,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro no webhook n8n:', error)
    return NextResponse.json(
      {
        error: 'Erro ao processar webhook',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
