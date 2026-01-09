import { NextRequest, NextResponse } from 'next/server'
import { buscarAssistentePorId } from '@/lib/google-sheets'

// GET /api/assistentes/[id] - Busca um assistente por ID
export async function GET(
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

    const assistente = await buscarAssistentePorId(id)

    if (!assistente) {
      return NextResponse.json(
        {
          success: false,
          error: 'Assistente não encontrado',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: assistente,
    })
  } catch (error) {
    console.error('Erro ao buscar assistente:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar assistente',
      },
      { status: 500 }
    )
  }
}
