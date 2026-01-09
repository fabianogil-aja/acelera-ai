'use client'

import { useEffect, useState } from 'react'
import { CardsMetricas } from '@/components/dashboard/cards-metricas'
import { GraficoStatus } from '@/components/dashboard/grafico-status'
import { GraficoCriacoes } from '@/components/dashboard/grafico-criacoes'
import { TabelaPendencias } from '@/components/dashboard/tabela-pendencias'
import { RankingCriadores } from '@/components/dashboard/ranking-criadores'
import { toast } from 'sonner'
import type { Metricas, Assistente, AssistenteStatus } from '@/lib/types'

interface MetricasResponse {
  metricas: Metricas
  graficos: {
    assistentes_por_status: {
      status: AssistenteStatus
      quantidade: number
    }[]
    criacoes_por_semana: {
      semana: string
      quantidade: number
    }[]
    criadores_ativos: {
      nome: string
      email: string
      quantidade: number
    }[]
    taxa_report_por_semana: {
      semana: string
      taxa: number
    }[]
  }
}

export default function DashboardPage() {
  const [metricas, setMetricas] = useState<MetricasResponse | null>(null)
  const [assistentes, setAssistentes] = useState<Assistente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarDados() {
      try {
        const [metricasRes, assistentesRes] = await Promise.all([
          fetch('/api/metricas'),
          fetch('/api/assistentes'),
        ])

        const metricasData = await metricasRes.json()
        const assistentesData = await assistentesRes.json()

        if (metricasData.success) {
          setMetricas(metricasData.data)
        }

        if (assistentesData.success) {
          setAssistentes(assistentesData.data)
        }
      } catch {
        toast.error('Erro ao carregar dados do dashboard')
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [])

  const pendentes = assistentes.filter((a) => a.status === 'PENDENTE')
  const aguardandoReport = assistentes.filter(
    (a) => a.status === 'AGUARDANDO_REPORT'
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">
          Visão geral do programa Acelera AI
        </p>
      </div>

      {/* Cards de Métricas */}
      {metricas && <CardsMetricas metricas={metricas.metricas} />}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metricas && (
          <>
            <GraficoStatus dados={metricas.graficos.assistentes_por_status} />
            <GraficoCriacoes dados={metricas.graficos.criacoes_por_semana} />
          </>
        )}
      </div>

      {/* Pendências e Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TabelaPendencias
          pendentes={pendentes}
          aguardandoReport={aguardandoReport}
        />
        {metricas && (
          <RankingCriadores criadores={metricas.graficos.criadores_ativos} />
        )}
      </div>
    </div>
  )
}
