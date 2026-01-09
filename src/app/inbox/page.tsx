'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Inbox,
  Bell,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import type { Alerta, TipoAlerta } from '@/lib/types'
import { ALERTA_LABELS } from '@/config/constants'

export default function InboxPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<string>('todos')

  useEffect(() => {
    async function carregarAlertas() {
      try {
        const response = await fetch('/api/alertas')
        const data = await response.json()

        if (data.success) {
          setAlertas(data.data)
        }
      } catch {
        toast.error('Erro ao carregar alertas')
      } finally {
        setLoading(false)
      }
    }

    carregarAlertas()
  }, [])

  const formatarData = (data: string) => {
    return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  const getIcone = (tipo: TipoAlerta) => {
    switch (tipo) {
      case 'NOVA_SUBMISSAO':
        return Bell
      case 'PRAZO_PROXIMO':
        return Clock
      case 'REPORT_RECEBIDO':
        return FileText
      case 'EXPIRADO':
        return AlertTriangle
      default:
        return Bell
    }
  }

  const getCor = (tipo: TipoAlerta) => {
    switch (tipo) {
      case 'NOVA_SUBMISSAO':
        return 'bg-blue-100 text-blue-600'
      case 'PRAZO_PROXIMO':
        return 'bg-amber-100 text-amber-600'
      case 'REPORT_RECEBIDO':
        return 'bg-green-100 text-green-600'
      case 'EXPIRADO':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  const alertasFiltrados =
    filtro === 'todos'
      ? alertas
      : alertas.filter((a) => a.tipo === filtro)

  const contagem = {
    todos: alertas.length,
    NOVA_SUBMISSAO: alertas.filter((a) => a.tipo === 'NOVA_SUBMISSAO').length,
    PRAZO_PROXIMO: alertas.filter((a) => a.tipo === 'PRAZO_PROXIMO').length,
    REPORT_RECEBIDO: alertas.filter((a) => a.tipo === 'REPORT_RECEBIDO').length,
    EXPIRADO: alertas.filter((a) => a.tipo === 'EXPIRADO').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Inbox</h1>
        <p className="text-slate-500">Alertas e notificações do sistema</p>
      </div>

      {/* Tabs de filtro */}
      <Tabs value={filtro} onValueChange={setFiltro}>
        <TabsList>
          <TabsTrigger value="todos" className="gap-2">
            Todos
            <Badge variant="secondary" className="ml-1">
              {contagem.todos}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="NOVA_SUBMISSAO" className="gap-2">
            Novas
            {contagem.NOVA_SUBMISSAO > 0 && (
              <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700">
                {contagem.NOVA_SUBMISSAO}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="PRAZO_PROXIMO" className="gap-2">
            Prazos
            {contagem.PRAZO_PROXIMO > 0 && (
              <Badge variant="secondary" className="ml-1 bg-amber-100 text-amber-700">
                {contagem.PRAZO_PROXIMO}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="EXPIRADO" className="gap-2">
            Expirados
            {contagem.EXPIRADO > 0 && (
              <Badge variant="secondary" className="ml-1 bg-red-100 text-red-700">
                {contagem.EXPIRADO}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filtro} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
            </div>
          ) : alertasFiltrados.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <p className="text-lg font-medium text-slate-900">
                  Tudo em dia!
                </p>
                <p className="text-sm text-slate-500">
                  Não há alertas pendentes nesta categoria
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {alertasFiltrados.map((alerta) => {
                const Icone = getIcone(alerta.tipo)
                return (
                  <Card key={alerta.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-2 rounded-lg ${getCor(alerta.tipo)}`}
                        >
                          <Icone className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="outline" className="text-xs">
                              {ALERTA_LABELS[alerta.tipo]}
                            </Badge>
                            <span className="text-xs text-slate-400">
                              {formatarData(alerta.data)}
                            </span>
                          </div>
                          <h4 className="font-medium text-slate-900 mt-1">
                            {alerta.assistente_titulo}
                          </h4>
                          <p className="text-sm text-slate-500 mt-1">
                            {alerta.mensagem}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Criador: {alerta.criador_nome}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/assistentes/${alerta.assistente_id}`}>
                            Ver
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Resumo */}
      {!loading && alertas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Inbox className="w-5 h-5" />
              Resumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <Bell className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  {contagem.NOVA_SUBMISSAO}
                </p>
                <p className="text-xs text-blue-600">Novas Submissões</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-amber-50">
                <Clock className="w-6 h-6 mx-auto text-amber-600 mb-2" />
                <p className="text-2xl font-bold text-amber-600">
                  {contagem.PRAZO_PROXIMO}
                </p>
                <p className="text-xs text-amber-600">Prazos Próximos</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50">
                <FileText className="w-6 h-6 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {contagem.REPORT_RECEBIDO}
                </p>
                <p className="text-xs text-green-600">Reports Recebidos</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-50">
                <AlertTriangle className="w-6 h-6 mx-auto text-red-600 mb-2" />
                <p className="text-2xl font-bold text-red-600">
                  {contagem.EXPIRADO}
                </p>
                <p className="text-xs text-red-600">Expirados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
