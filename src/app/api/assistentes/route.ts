import { NextRequest, NextResponse } from 'next/server'
import { listarAssistentes, criarAssistente } from '@/lib/google-sheets'
import type { FiltrosAssistente, CriarAssistenteInput } from '@/lib/types'

// Desabilita cache para sempre buscar dados atualizados
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/assistentes - Lista assistentes com filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filtros: FiltrosAssistente = {}

    const status = searchParams.get('status')
    if (status) {
      filtros.status = status as FiltrosAssistente['status']
    }

    const criadorEmail = searchParams.get('criador_email')
    if (criadorEmail) {
      filtros.criador_email = criadorEmail
    }

    const setor = searchParams.get('setor')
    if (setor) {
      filtros.setor = setor
    }

    const periodoInicio = searchParams.get('periodo_inicio')
    if (periodoInicio) {
      filtros.periodo_inicio = periodoInicio
    }

    const periodoFim = searchParams.get('periodo_fim')
    if (periodoFim) {
      filtros.periodo_fim = periodoFim
    }

    const busca = searchParams.get('busca')
    if (busca) {
      filtros.busca = busca
    }

    const assistentes = await listarAssistentes(filtros)

    return NextResponse.json({
      success: true,
      data: assistentes,
      total: assistentes.length,
    })
  } catch (error) {
    console.error('Erro ao listar assistentes:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao listar assistentes',
      },
      { status: 500 }
    )
  }
}

// POST /api/assistentes - Cria um novo assistente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validação básica
    const camposObrigatorios: (keyof CriarAssistenteInput)[] = [
      'titulo',
      'link_gem',
      'criador_nome',
      'criador_email',
      'criador_setor',
      'problema_resolvido',
      'o_que_faz',
      'como_usar',
      'complexidade',
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

    // Valida URL do Gem
    try {
      new URL(body.link_gem)
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'URL do Gem inválida',
        },
        { status: 400 }
      )
    }

    // Valida email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.criador_email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email inválido',
        },
        { status: 400 }
      )
    }

    // Valida complexidade
    const complexidadesValidas = ['BAIXA', 'MEDIA', 'ALTA']
    if (!complexidadesValidas.includes(body.complexidade)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Complexidade inválida. Use: BAIXA, MEDIA ou ALTA',
        },
        { status: 400 }
      )
    }

    const assistente = await criarAssistente(body as CriarAssistenteInput)

    return NextResponse.json(
      {
        success: true,
        data: assistente,
        message: 'Assistente criado com sucesso',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar assistente:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao criar assistente',
      },
      { status: 500 }
    )
  }
}
