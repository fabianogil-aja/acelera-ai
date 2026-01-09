import { NextRequest, NextResponse } from 'next/server'
import { gerarRelatorio } from '@/lib/google-sheets'
import { startOfWeek, endOfWeek, subWeeks, format } from 'date-fns'

// GET /api/relatorio - Gera relatório por período
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    let periodoInicio = searchParams.get('periodo_inicio')
    let periodoFim = searchParams.get('periodo_fim')
    const tipo = searchParams.get('tipo') // semana_atual, semana_passada, customizado

    const agora = new Date()

    // Define períodos pré-definidos
    if (tipo === 'semana_atual' || (!periodoInicio && !periodoFim)) {
      periodoInicio = startOfWeek(agora, { weekStartsOn: 0 }).toISOString()
      periodoFim = endOfWeek(agora, { weekStartsOn: 0 }).toISOString()
    } else if (tipo === 'semana_passada') {
      const semanaPassada = subWeeks(agora, 1)
      periodoInicio = startOfWeek(semanaPassada, { weekStartsOn: 0 }).toISOString()
      periodoFim = endOfWeek(semanaPassada, { weekStartsOn: 0 }).toISOString()
    }

    if (!periodoInicio || !periodoFim) {
      return NextResponse.json(
        {
          success: false,
          error: 'Período não fornecido',
        },
        { status: 400 }
      )
    }

    const relatorio = await gerarRelatorio(periodoInicio, periodoFim)

    return NextResponse.json({
      success: true,
      data: relatorio,
      meta: {
        periodo: {
          inicio: format(new Date(periodoInicio), 'dd/MM/yyyy'),
          fim: format(new Date(periodoFim), 'dd/MM/yyyy'),
        },
        gerado_em: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao gerar relatório',
      },
      { status: 500 }
    )
  }
}
