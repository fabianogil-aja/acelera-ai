import { NextRequest, NextResponse } from 'next/server'
import { aprovarAssistente } from '@/lib/google-sheets'
import { enviarNotificacaoAprovacao } from '@/lib/slack'

// POST /api/assistentes/[id]/aprovar - Aprova um assistente
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

    const assistente = await aprovarAssistente(id)

    // Envia notificação para o Slack
    await enviarNotificacaoAprovacao(
      assistente.titulo,
      assistente.criador_nome,
      assistente.criador_email
    )

    return NextResponse.json({
      success: true,
      data: assistente,
      message: 'Assistente aprovado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao aprovar assistente:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Erro ao aprovar assistente'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400 }
    )
  }
}
