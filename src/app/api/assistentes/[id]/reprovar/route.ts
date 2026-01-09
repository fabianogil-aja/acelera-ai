import { NextRequest, NextResponse } from 'next/server'
import { reprovarAssistente } from '@/lib/google-sheets'
import { enviarNotificacaoReprovacao } from '@/lib/slack'

// POST /api/assistentes/[id]/reprovar - Reprova um assistente
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

    let motivo: string | undefined
    try {
      const body = await request.json()
      motivo = body.motivo
    } catch {
      // Body vazio é permitido
    }

    const assistente = await reprovarAssistente(id, motivo)

    // Envia notificação para o Slack
    await enviarNotificacaoReprovacao(
      assistente.titulo,
      assistente.criador_nome,
      assistente.criador_email,
      motivo
    )

    return NextResponse.json({
      success: true,
      data: assistente,
      message: 'Assistente reprovado',
    })
  } catch (error) {
    console.error('Erro ao reprovar assistente:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Erro ao reprovar assistente'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400 }
    )
  }
}
