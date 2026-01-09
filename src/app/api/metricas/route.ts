import { NextResponse } from 'next/server'
import { obterMetricas, listarAssistentes } from '@/lib/google-sheets'
import { startOfWeek, subWeeks, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { AssistenteStatus } from '@/lib/types'

// GET /api/metricas - Retorna métricas do dashboard
export async function GET() {
  try {
    const metricas = await obterMetricas()
    const assistentes = await listarAssistentes()

    // Assistentes por status
    const statusCount = new Map<AssistenteStatus, number>()
    const statusList: AssistenteStatus[] = [
      'PENDENTE',
      'APROVADO',
      'AGUARDANDO_REPORT',
      'CONCLUIDO',
      'EXPIRADO',
      'REPROVADO',
    ]

    for (const status of statusList) {
      statusCount.set(status, 0)
    }

    for (const a of assistentes) {
      const count = statusCount.get(a.status) || 0
      statusCount.set(a.status, count + 1)
    }

    const assistentesPorStatus = statusList.map((status) => ({
      status,
      quantidade: statusCount.get(status) || 0,
    }))

    // Criações por semana (últimas 8 semanas)
    const criacoesPorSemana: { semana: string; quantidade: number }[] = []
    const agora = new Date()

    for (let i = 7; i >= 0; i--) {
      const inicioSemana = startOfWeek(subWeeks(agora, i), { weekStartsOn: 0 })
      const fimSemana = startOfWeek(subWeeks(agora, i - 1), { weekStartsOn: 0 })

      const quantidade = assistentes.filter((a) => {
        const dataCriacao = parseISO(a.data_criacao)
        return dataCriacao >= inicioSemana && dataCriacao < fimSemana
      }).length

      criacoesPorSemana.push({
        semana: format(inicioSemana, 'dd/MM', { locale: ptBR }),
        quantidade,
      })
    }

    // Criadores ativos (top 10)
    const criadoresMap = new Map<
      string,
      { nome: string; email: string; quantidade: number }
    >()

    for (const a of assistentes) {
      const existing = criadoresMap.get(a.criador_email) || {
        nome: a.criador_nome,
        email: a.criador_email,
        quantidade: 0,
      }
      existing.quantidade++
      criadoresMap.set(a.criador_email, existing)
    }

    const criadoresAtivos = Array.from(criadoresMap.values())
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10)

    // Taxa de report por semana
    const taxaReportPorSemana: { semana: string; taxa: number }[] = []

    for (let i = 7; i >= 0; i--) {
      const inicioSemana = startOfWeek(subWeeks(agora, i), { weekStartsOn: 0 })
      const fimSemana = startOfWeek(subWeeks(agora, i - 1), { weekStartsOn: 0 })

      const aprovadosSemana = assistentes.filter((a) => {
        if (!a.data_aprovacao) return false
        const dataAprovacao = parseISO(a.data_aprovacao)
        return dataAprovacao >= inicioSemana && dataAprovacao < fimSemana
      })

      const concluidosSemana = aprovadosSemana.filter(
        (a) => a.status === 'CONCLUIDO'
      )

      const taxa =
        aprovadosSemana.length > 0
          ? (concluidosSemana.length / aprovadosSemana.length) * 100
          : 0

      taxaReportPorSemana.push({
        semana: format(inicioSemana, 'dd/MM', { locale: ptBR }),
        taxa: Math.round(taxa * 10) / 10,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        metricas,
        graficos: {
          assistentes_por_status: assistentesPorStatus,
          criacoes_por_semana: criacoesPorSemana,
          criadores_ativos: criadoresAtivos,
          taxa_report_por_semana: taxaReportPorSemana,
        },
      },
    })
  } catch (error) {
    console.error('Erro ao obter métricas:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao obter métricas',
      },
      { status: 500 }
    )
  }
}
