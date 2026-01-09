'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CHART_COLORS, STATUS_LABELS } from '@/config/constants'
import type { AssistenteStatus } from '@/lib/types'

interface GraficoStatusProps {
  dados: {
    status: AssistenteStatus
    quantidade: number
  }[]
}

export function GraficoStatus({ dados }: GraficoStatusProps) {
  const dadosFormatados = dados
    .filter((d) => d.quantidade > 0)
    .map((d) => ({
      name: STATUS_LABELS[d.status],
      value: d.quantidade,
      color: CHART_COLORS[d.status],
    }))

  if (dadosFormatados.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assistentes por Status</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-slate-500">
          Nenhum dado disponível
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Assistentes por Status</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dadosFormatados}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {dadosFormatados.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [value, 'Quantidade']}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
