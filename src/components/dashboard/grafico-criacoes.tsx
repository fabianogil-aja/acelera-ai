'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GraficoCriacoesProps {
  dados: {
    semana: string
    quantidade: number
  }[]
}

export function GraficoCriacoes({ dados }: GraficoCriacoesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Criações por Semana</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="semana"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value) => [value, 'Assistentes']}
              labelFormatter={(label) => `Semana de ${label}`}
            />
            <Bar
              dataKey="quantidade"
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
