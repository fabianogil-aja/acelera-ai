'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle, XCircle, FileText, Clock, Bell, Sparkles } from 'lucide-react'
import type { Assistente } from '@/lib/types'

interface TimelineEventosProps {
  assistente: Assistente
}

interface Evento {
  tipo: string
  data: string
  titulo: string
  descricao: string
  icon: React.ElementType
  cor: string
}

export function TimelineEventos({ assistente }: TimelineEventosProps) {
  const eventos: Evento[] = []

  // Evento de criação
  eventos.push({
    tipo: 'CRIADO',
    data: assistente.data_criacao,
    titulo: 'Assistente Criado',
    descricao: `Submetido por ${assistente.criador_nome}`,
    icon: Sparkles,
    cor: 'text-violet-500 bg-violet-100',
  })

  // Evento de aprovação ou reprovação
  if (assistente.data_aprovacao && assistente.status !== 'REPROVADO') {
    eventos.push({
      tipo: 'APROVADO',
      data: assistente.data_aprovacao,
      titulo: 'Aprovado',
      descricao: `Crédito de R$${assistente.credito_criacao} adicionado`,
      icon: CheckCircle,
      cor: 'text-green-500 bg-green-100',
    })
  }

  if (assistente.status === 'REPROVADO') {
    eventos.push({
      tipo: 'REPROVADO',
      data: assistente.data_aprovacao || new Date().toISOString(),
      titulo: 'Reprovado',
      descricao: assistente.motivo_reprovacao || 'Sem motivo informado',
      icon: XCircle,
      cor: 'text-red-500 bg-red-100',
    })
  }

  // Evento de prazo
  if (assistente.data_limite_report && assistente.status !== 'REPROVADO') {
    const diasRestantes = Math.ceil(
      (new Date(assistente.data_limite_report).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    )

    if (
      assistente.status === 'AGUARDANDO_REPORT' ||
      assistente.status === 'APROVADO'
    ) {
      eventos.push({
        tipo: 'PRAZO',
        data: assistente.data_limite_report,
        titulo: 'Prazo do Report',
        descricao:
          diasRestantes > 0
            ? `${diasRestantes} dia(s) restantes`
            : 'Prazo expirado',
        icon: Clock,
        cor:
          diasRestantes <= 3
            ? 'text-red-500 bg-red-100'
            : 'text-amber-500 bg-amber-100',
      })
    }
  }

  // Alertas enviados
  if (assistente.notificacao_enviada_7d) {
    eventos.push({
      tipo: 'ALERTA',
      data: '', // Não temos a data exata
      titulo: 'Alerta 7 dias',
      descricao: 'Notificação enviada',
      icon: Bell,
      cor: 'text-amber-500 bg-amber-100',
    })
  }

  if (assistente.notificacao_enviada_3d) {
    eventos.push({
      tipo: 'ALERTA',
      data: '',
      titulo: 'Alerta 3 dias',
      descricao: 'Notificação enviada',
      icon: Bell,
      cor: 'text-orange-500 bg-orange-100',
    })
  }

  if (assistente.notificacao_enviada_1d) {
    eventos.push({
      tipo: 'ALERTA',
      data: '',
      titulo: 'Alerta 1 dia',
      descricao: 'Notificação enviada',
      icon: Bell,
      cor: 'text-red-500 bg-red-100',
    })
  }

  // Evento de report
  if (assistente.data_report) {
    eventos.push({
      tipo: 'REPORT',
      data: assistente.data_report,
      titulo: 'Report Registrado',
      descricao:
        assistente.credito_report > 0
          ? `Crédito de R$${assistente.credito_report} adicionado`
          : 'Enviado fora do prazo',
      icon: FileText,
      cor:
        assistente.credito_report > 0
          ? 'text-green-500 bg-green-100'
          : 'text-amber-500 bg-amber-100',
    })
  }

  // Ordenar eventos por data
  const eventosComData = eventos.filter((e) => e.data)
  eventosComData.sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  )

  const formatarData = (data: string) => {
    if (!data) return ''
    return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  return (
    <div className="space-y-4">
      {eventosComData.map((evento, index) => (
        <div key={index} className="flex gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${evento.cor}`}
          >
            <evento.icon className="w-5 h-5" />
          </div>
          <div className="flex-1 pb-4 border-b last:border-0">
            <p className="font-medium text-slate-900">{evento.titulo}</p>
            <p className="text-sm text-slate-500">{evento.descricao}</p>
            {evento.data && (
              <p className="text-xs text-slate-400 mt-1">
                {formatarData(evento.data)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
