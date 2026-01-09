import { NextRequest, NextResponse } from 'next/server'
import { criarAssistente, listarAssistentes } from '@/lib/google-sheets'
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
    // SEGURANÇA: Validar token de webhook
    const webhookToken = request.headers.get('x-webhook-token')
    const expectedToken = process.env.N8N_WEBHOOK_TOKEN

    if (!expectedToken) {
      console.error('N8N_WEBHOOK_TOKEN não configurado no ambiente')
      return NextResponse.json(
        { error: 'Configuração de segurança inválida' },
        { status: 500 }
      )
    }

    if (!webhookToken || webhookToken !== expectedToken) {
      console.warn('Tentativa de acesso ao webhook sem token válido')
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

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

      // Normaliza complexidade para uppercase e remove acentos
      const complexidadeNormalizada = payload.complexidade
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos

      const complexidade = complexidadeNormalizada as
        | 'BAIXA'
        | 'MEDIA'
        | 'ALTA'

      // Valida complexidade
      if (!['BAIXA', 'MEDIA', 'ALTA'].includes(complexidade)) {
        return NextResponse.json(
          {
            error: 'Complexidade inválida',
            allowed: ['BAIXA', 'MEDIA', 'ALTA'],
            received: complexidade,
          },
          { status: 400 }
        )
      }

      // Gera email caso não venha do n8n
      const criadorEmail =
        payload.criador_email ||
        `${payload.criador_nome.toLowerCase().replace(/\s+/g, '.')}@aja.com.br`

      // PROTEÇÃO CONTRA DUPLICATAS: Verifica se já existe assistente com mesmo título e criador
      const assistentesExistentes = await listarAssistentes()
      const jaExiste = assistentesExistentes.find(
        (a) =>
          a.titulo === payload.titulo &&
          a.criador_nome === payload.criador_nome &&
          a.status === 'PENDENTE'
      )

      if (jaExiste) {
        console.warn(
          `Assistente duplicado ignorado: ${payload.titulo} - ${payload.criador_nome}`
        )
        // Retorna o assistente existente em vez de criar duplicata
        resultados.push({
          id: jaExiste.id,
          titulo: jaExiste.titulo,
          status: jaExiste.status,
          duplicado: true,
        })
        continue // Pula para o próximo payload
      }

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
        // Não quebra se o Slack falhar - log sanitizado
        console.error('Erro ao enviar notificação Slack')
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
    // Log sanitizado - não expõe credenciais ou dados sensíveis
    console.error('Erro no webhook n8n')
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack trace:', error instanceof Error ? error.message : 'Unknown')
    }

    return NextResponse.json(
      {
        error: 'Erro ao processar webhook',
        // NUNCA retornar error.message em produção
      },
      { status: 500 }
    )
  }
}
