'use client'

import { useEffect, useState } from 'react'
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Download, FileText, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import type { Relatorio } from '@/lib/types'

export default function RelatoriosPage() {
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('semana_atual')

  const carregarRelatorio = async (tipo: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/relatorio?tipo=${tipo}`)
      const data = await response.json()

      if (data.success) {
        setRelatorio(data.data)
      } else {
        toast.error('Erro ao carregar relatório')
      }
    } catch {
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarRelatorio(periodo)
  }, [periodo])

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  const exportarCSV = () => {
    if (!relatorio || relatorio.itens.length === 0) {
      toast.error('Nenhum dado para exportar')
      return
    }

    const headers = [
      'Colaborador',
      'Email',
      'Assistentes',
      'Crédito Criação',
      'Crédito Report',
      'Total',
    ]
    const rows = relatorio.itens.map((item) => [
      item.colaborador_nome,
      item.colaborador_email,
      item.quantidade_assistentes,
      item.credito_criacao_total,
      item.credito_report_total,
      item.credito_total,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
      '',
      `Total Geral,,,,${relatorio.total_geral}`,
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `relatorio_acelera_ai_${format(new Date(), 'yyyy-MM-dd')}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Relatório exportado com sucesso')
  }

  const getPeriodoLabel = () => {
    const agora = new Date()
    if (periodo === 'semana_atual') {
      const inicio = startOfWeek(agora, { weekStartsOn: 0 })
      const fim = endOfWeek(agora, { weekStartsOn: 0 })
      return `${format(inicio, 'dd/MM/yyyy')} - ${format(fim, 'dd/MM/yyyy')}`
    } else {
      const semanaPassada = subWeeks(agora, 1)
      const inicio = startOfWeek(semanaPassada, { weekStartsOn: 0 })
      const fim = endOfWeek(semanaPassada, { weekStartsOn: 0 })
      return `${format(inicio, 'dd/MM/yyyy')} - ${format(fim, 'dd/MM/yyyy')}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
          <p className="text-slate-500">
            Relatório de créditos para pagamento
          </p>
        </div>
        <Button onClick={exportarCSV} className="gap-2">
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Período:</span>
            </div>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana_atual">Semana Atual</SelectItem>
                <SelectItem value="semana_passada">Semana Passada</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-500">{getPeriodoLabel()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
        </div>
      ) : relatorio && relatorio.itens.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Créditos por Colaborador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Assistentes</TableHead>
                  <TableHead className="text-right">Crédito Criação</TableHead>
                  <TableHead className="text-right">Crédito Report</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatorio.itens.map((item) => (
                  <TableRow key={item.colaborador_email}>
                    <TableCell className="font-medium">
                      {item.colaborador_nome}
                    </TableCell>
                    <TableCell>{item.colaborador_email}</TableCell>
                    <TableCell className="text-center">
                      {item.quantidade_assistentes}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatarMoeda(item.credito_criacao_total)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatarMoeda(item.credito_report_total)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      {formatarMoeda(item.credito_total)}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Totalizador */}
                <TableRow className="bg-slate-50 font-bold">
                  <TableCell colSpan={5}>Total Geral</TableCell>
                  <TableCell className="text-right text-green-600 text-lg">
                    {formatarMoeda(relatorio.total_geral)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-900">
              Nenhum crédito no período
            </p>
            <p className="text-sm text-slate-500">
              Não há assistentes aprovados com créditos neste período
            </p>
          </CardContent>
        </Card>
      )}

      {/* Detalhes dos assistentes */}
      {relatorio && relatorio.itens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalhamento por Assistente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {relatorio.itens.map((item) => (
                <div key={item.colaborador_email}>
                  <h4 className="font-medium text-slate-900 mb-2">
                    {item.colaborador_nome}
                  </h4>
                  <div className="pl-4 border-l-2 border-slate-200 space-y-2">
                    {item.assistentes.map((assistente) => (
                      <div
                        key={assistente.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-slate-600">
                          {assistente.titulo}
                        </span>
                        <div className="flex gap-4">
                          <span className="text-slate-500">
                            Criação: {formatarMoeda(assistente.credito_criacao)}
                          </span>
                          <span className="text-slate-500">
                            Report: {formatarMoeda(assistente.credito_report)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
