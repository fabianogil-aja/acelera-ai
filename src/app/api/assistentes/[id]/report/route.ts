import { NextRequest, NextResponse } from 'next/server'
import { registrarReport } from '@/lib/google-sheets'
import { enviarNotificacaoReportRecebido } from '@/lib/slack'
import type { RegistrarReportInput } from '@/lib/types'

// POST /api/assistentes/[id]/report - Registra um report de impacto
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID não fornecido',
        },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validação
    const camposObrigatorios: (keyof RegistrarReportInput)[] = [
      'report_resultado',
      'report_melhoria',
      'report_aprendizados',
    ]

    for (const campo of camposObrigatorios) {
      if (!body[campo]) {
        return NextResponse.json(
          {
            success: false,
            error: `Campo obrigatório: ${campo}`,
          },
          { status: 400 }
        )
      }
    }

    const assistente = await registrarReport(id, body as RegistrarReportInput)

    // Envia notificação para o Slack
    await enviarNotificacaoReportRecebido(
      assistente.titulo,
      assistente.criador_nome,
      assistente.credito_report
    )

    return NextResponse.json({
      success: true,
      data: assistente,
      message:
        assistente.credito_report > 0
          ? 'Report registrado com sucesso! Crédito de R$35,00 adicionado.'
          : 'Report registrado, mas fora do prazo. Sem crédito adicional.',
    })
  } catch (error) {
    console.error('Erro ao registrar report:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Erro ao registrar report'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400 }
    )
  }
}
