'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TabelaAssistentes } from '@/components/assistentes/tabela-assistentes'
import { FiltrosAssistentes } from '@/components/assistentes/filtros-assistentes'
import { toast } from 'sonner'
import type { Assistente, AssistenteStatus } from '@/lib/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/config/constants'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function AssistentesPage() {
  const [assistentes, setAssistentes] = useState<Assistente[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')
  const [setor, setSetor] = useState('')

  // Dialog de reprovação
  const [dialogReprovarOpen, setDialogReprovarOpen] = useState(false)
  const [assistenteParaReprovar, setAssistenteParaReprovar] = useState<
    string | null
  >(null)
  const [motivoReprovacao, setMotivoReprovacao] = useState('')

  // Dialog de report
  const [dialogReportOpen, setDialogReportOpen] = useState(false)
  const [assistenteParaReport, setAssistenteParaReport] = useState<
    string | null
  >(null)
  const [reportResultado, setReportResultado] = useState('')
  const [reportMelhoria, setReportMelhoria] = useState('')
  const [reportAprendizados, setReportAprendizados] = useState('')

  const carregarAssistentes = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (busca) params.set('busca', busca)
      if (status && status !== 'all') params.set('status', status)
      if (setor && setor !== 'all') params.set('setor', setor)

      const response = await fetch(`/api/assistentes?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setAssistentes(data.data)
      } else {
        toast.error('Erro ao carregar assistentes')
      }
    } catch {
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }, [busca, status, setor])

  useEffect(() => {
    carregarAssistentes()
  }, [carregarAssistentes])

  const handleAprovar = async (id: string) => {
    try {
      const response = await fetch(`/api/assistentes/${id}/aprovar`, {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Assistente aprovado com sucesso!')
        carregarAssistentes()
      } else {
        toast.error(data.error || 'Erro ao aprovar assistente')
      }
    } catch {
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleReprovar = (id: string) => {
    setAssistenteParaReprovar(id)
    setMotivoReprovacao('')
    setDialogReprovarOpen(true)
  }

  const confirmarReprovacao = async () => {
    if (!assistenteParaReprovar) return

    try {
      const response = await fetch(
        `/api/assistentes/${assistenteParaReprovar}/reprovar`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ motivo: motivoReprovacao }),
        }
      )
      const data = await response.json()

      if (data.success) {
        toast.success('Assistente reprovado')
        setDialogReprovarOpen(false)
        carregarAssistentes()
      } else {
        toast.error(data.error || 'Erro ao reprovar assistente')
      }
    } catch {
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleRegistrarReport = (id: string) => {
    setAssistenteParaReport(id)
    setReportResultado('')
    setReportMelhoria('')
    setReportAprendizados('')
    setDialogReportOpen(true)
  }

  const confirmarReport = async () => {
    if (!assistenteParaReport) return

    if (!reportResultado || !reportMelhoria || !reportAprendizados) {
      toast.error('Preencha todos os campos do report')
      return
    }

    try {
      const response = await fetch(
        `/api/assistentes/${assistenteParaReport}/report`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            report_resultado: reportResultado,
            report_melhoria: reportMelhoria,
            report_aprendizados: reportAprendizados,
          }),
        }
      )
      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        setDialogReportOpen(false)
        carregarAssistentes()
      } else {
        toast.error(data.error || 'Erro ao registrar report')
      }
    } catch {
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const limparFiltros = () => {
    setBusca('')
    setStatus('')
    setSetor('')
  }

  // Contagem por status
  const contagemStatus = assistentes.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1
      return acc
    },
    {} as Record<AssistenteStatus, number>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assistentes</h1>
          <p className="text-slate-500">
            Gerencie os assistentes de IA do programa
          </p>
        </div>
        <Button asChild>
          <Link href="/assistentes/novo">
            <Plus className="w-4 h-4 mr-2" />
            Novo Assistente
          </Link>
        </Button>
      </div>

      {/* Cards de status */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {(
          [
            'PENDENTE',
            'APROVADO',
            'AGUARDANDO_REPORT',
            'CONCLUIDO',
            'EXPIRADO',
            'REPROVADO',
          ] as AssistenteStatus[]
        ).map((statusKey) => (
          <Card key={statusKey} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatus(statusKey)}>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">{STATUS_LABELS[statusKey]}</p>
              <p className="text-2xl font-bold">{contagemStatus[statusKey] || 0}</p>
              <div className={`w-full h-1 mt-2 rounded ${STATUS_COLORS[statusKey].split(' ')[0]}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <FiltrosAssistentes
        busca={busca}
        setBusca={setBusca}
        status={status}
        setStatus={setStatus}
        setor={setor}
        setSetor={setSetor}
        onLimpar={limparFiltros}
      />

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
        </div>
      ) : (
        <TabelaAssistentes
          assistentes={assistentes}
          onAprovar={handleAprovar}
          onReprovar={handleReprovar}
          onRegistrarReport={handleRegistrarReport}
        />
      )}

      {/* Dialog de Reprovação */}
      <Dialog open={dialogReprovarOpen} onOpenChange={setDialogReprovarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprovar Assistente</DialogTitle>
            <DialogDescription>
              Informe o motivo da reprovação (opcional)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="motivo">Motivo</Label>
            <Textarea
              id="motivo"
              placeholder="Ex: O Gem não foi encontrado no link informado..."
              value={motivoReprovacao}
              onChange={(e) => setMotivoReprovacao(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDialogReprovarOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarReprovacao}>
              Reprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Report */}
      <Dialog open={dialogReportOpen} onOpenChange={setDialogReportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Report de Impacto</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo com o feedback do colaborador
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="resultado">Resultado Real *</Label>
              <Textarea
                id="resultado"
                placeholder="Descreva os resultados obtidos com o assistente..."
                value={reportResultado}
                onChange={(e) => setReportResultado(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="melhoria">Por que é melhor que antes *</Label>
              <Textarea
                id="melhoria"
                placeholder="Explique as melhorias em comparação com o processo anterior..."
                value={reportMelhoria}
                onChange={(e) => setReportMelhoria(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="aprendizados">Aprendizados *</Label>
              <Textarea
                id="aprendizados"
                placeholder="Compartilhe os aprendizados durante o uso..."
                value={reportAprendizados}
                onChange={(e) => setReportAprendizados(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogReportOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarReport}>Registrar Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
