'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Bot,
  Clock,
  FileText,
  TrendingUp,
  DollarSign,
  CreditCard,
} from 'lucide-react'
import type { Metricas } from '@/lib/types'

interface CardsMetricasProps {
  metricas: Metricas
}

export function CardsMetricas({ metricas }: CardsMetricasProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  const cards = [
    {
      titulo: 'Total de Assistentes',
      valor: metricas.total_assistentes,
      icon: Bot,
      cor: 'text-violet-600',
      bgCor: 'bg-violet-100',
    },
    {
      titulo: 'Aguardando Aprovação',
      valor: metricas.aguardando_aprovacao,
      icon: Clock,
      cor: 'text-amber-600',
      bgCor: 'bg-amber-100',
    },
    {
      titulo: 'Aguardando Report',
      valor: metricas.aguardando_report,
      icon: FileText,
      cor: 'text-orange-600',
      bgCor: 'bg-orange-100',
    },
    {
      titulo: 'Taxa de Conclusão',
      valor: `${metricas.taxa_conclusao}%`,
      icon: TrendingUp,
      cor: 'text-green-600',
      bgCor: 'bg-green-100',
    },
    {
      titulo: 'Creditado (Mês)',
      valor: formatarMoeda(metricas.total_creditado_mes),
      icon: DollarSign,
      cor: 'text-emerald-600',
      bgCor: 'bg-emerald-100',
    },
    {
      titulo: 'A Pagar (Semana)',
      valor: formatarMoeda(metricas.total_a_pagar_semana),
      icon: CreditCard,
      cor: 'text-blue-600',
      bgCor: 'bg-blue-100',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500 truncate">{card.titulo}</p>
              <div className={`p-2 rounded-lg ${card.bgCor}`}>
                <card.icon className={`w-4 h-4 ${card.cor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{card.valor}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
