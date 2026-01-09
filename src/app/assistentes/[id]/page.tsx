'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ArrowLeft,
  ExternalLink,
  Check,
  X,
  FileText,
  User,
  Mail,
  Building,
  Calendar,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { TimelineEventos } from '@/components/assistentes/timeline-eventos'
import { toast } from 'sonner'
import type { Assistente } from '@/lib/types'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  COMPLEXIDADE_LABELS,
} from '@/config/constants'
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

export default function DetalheAssistentePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [assistente, setAssistente] = useState<Assistente | null>(null)
  const [loading, setLoading] = useState(true)

  // Dialog de reprovação
  const [dialogReprovarOpen, setDialogReprovarOpen] = useState(false)
  const [motivoReprovacao, setMotivoReprovacao] = useState('')

  // Dialog de report
  const [dialogReportOpen, setDialogReportOpen] = useState(false)
  const [reportResultado, setReportResultado] = useState('')
  const [reportMelhoria, setReportMelhoria] = useState('')
  const [reportAprendizados, setReportAprendizados] = useState('')

  const carregarAssistente = async () => {
    try {
      const response = await fetch(`/api/assistentes/${resolvedParams.id}`)
      const data = await response.json()

      if (data.success) {
        setAssistente(data.data)
      } else {
        toast.error('Assistente não encontrado')
        router.push('/assistentes')
      }
    } catch {
      toast.error('Erro ao carregar assistente')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarAssistente()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id])

  const handleAprovar = async () => {
    try {
      const response = await fetch(
        `/api/assistentes/${resolvedParams.id}/aprovar`,
        {
          method: 'POST',
        }
      )
      const data = await response.json()

      if (data.success) {
        toast.success('Assistente aprovado com sucesso!')
        carregarAssistente()
      } else {
        toast.error(data.error || 'Erro ao aprovar assistente')
      }
    } catch {
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const confirmarReprovacao = async () => {
    try {
      const response = await fetch(
        `/api/assistentes/${resolvedParams.id}/reprovar`,
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
        carregarAssistente()
      } else {
        toast.error(data.error || 'Erro ao reprovar assistente')
      }
    } catch {
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const confirmarReport = async () => {
    if (!reportResultado || !reportMelhoria || !reportAprendizados) {
      toast.error('Preencha todos os campos do report')
      return
    }

    try {
      const response = await fetch(
        `/api/assistentes/${resolvedParams.id}/report`,
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
        carregarAssistente()
      } else {
        toast.error(data.error || 'Erro ao registrar report')
      }
    } catch {
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const formatarData = (data: string | null) => {
    if (!data) return '-'
    return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR })
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    )
  }

  if (!assistente) {
    return null
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/assistentes">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {assistente.titulo}
              </h1>
              <Badge
                variant="outline"
                className={STATUS_COLORS[assistente.status]}
              >
                {STATUS_LABELS[assistente.status]}
              </Badge>
            </div>
            <a
              href={assistente.link_gem}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-violet-600 hover:underline flex items-center gap-1"
            >
              Ver Gem no Google <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          {assistente.status === 'PENDENTE' && (
            <>
              <Button onClick={handleAprovar} className="gap-2">
                <Check className="w-4 h-4" />
                Aprovar
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDialogReprovarOpen(true)}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Reprovar
              </Button>
            </>
          )}
          {(assistente.status === 'APROVADO' ||
            assistente.status === 'AGUARDANDO_REPORT') && (
            <Button onClick={() => setDialogReportOpen(true)} className="gap-2">
              <FileText className="w-4 h-4" />
              Registrar Report
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações do Criador */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Criador</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Nome</p>
                    <p className="font-medium">{assistente.criador_nome}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium">{assistente.criador_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Building className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Setor</p>
                    <p className="font-medium">{assistente.criador_setor}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhes do Assistente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-1">
                  Problema que Resolve
                </h4>
                <p className="text-slate-900">{assistente.problema_resolvido}</p>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-1">
                  O que ele faz
                </h4>
                <p className="text-slate-900">{assistente.o_que_faz}</p>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-1">
                  Como usar
                </h4>
                <p className="text-slate-900">{assistente.como_usar}</p>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-1">
                  Complexidade
                </h4>
                <Badge variant="secondary">
                  {COMPLEXIDADE_LABELS[assistente.complexidade]}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Report de Impacto */}
          {assistente.status === 'CONCLUIDO' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report de Impacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">
                    Resultado Real
                  </h4>
                  <p className="text-slate-900">{assistente.report_resultado}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">
                    Por que é melhor
                  </h4>
                  <p className="text-slate-900">{assistente.report_melhoria}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">
                    Aprendizados
                  </h4>
                  <p className="text-slate-900">
                    {assistente.report_aprendizados}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
          {/* Datas e Créditos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Criação</span>
                </div>
                <span className="font-medium">
                  {formatarData(assistente.data_criacao)}
                </span>
              </div>
              {assistente.data_aprovacao && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Aprovação</span>
                  </div>
                  <span className="font-medium">
                    {formatarData(assistente.data_aprovacao)}
                  </span>
                </div>
              )}
              {assistente.data_limite_report && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Prazo Report</span>
                  </div>
                  <span className="font-medium">
                    {formatarData(assistente.data_limite_report)}
                  </span>
                </div>
              )}
              {assistente.data_report && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Report</span>
                  </div>
                  <span className="font-medium">
                    {formatarData(assistente.data_report)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Crédito Criação</span>
                </div>
                <span className="font-medium text-green-600">
                  {formatarMoeda(assistente.credito_criacao)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Crédito Report</span>
                </div>
                <span className="font-medium text-green-600">
                  {formatarMoeda(assistente.credito_report)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900">Total</span>
                <span className="text-xl font-bold text-green-600">
                  {formatarMoeda(assistente.credito_total)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <TimelineEventos assistente={assistente} />
            </CardContent>
          </Card>
        </div>
      </div>

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
