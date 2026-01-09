'use client'

import Link from 'next/link'
import { format, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Clock, AlertTriangle } from 'lucide-react'
import type { Assistente } from '@/lib/types'

interface TabelaPendenciasProps {
  pendentes: Assistente[]
  aguardandoReport: Assistente[]
}

export function TabelaPendencias({
  pendentes,
  aguardandoReport,
}: TabelaPendenciasProps) {
  const formatarData = (data: string) => {
    return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR })
  }

  const diasRestantes = (dataLimite: string) => {
    return differenceInDays(new Date(dataLimite), new Date())
  }

  const urgencia = (dias: number) => {
    if (dias <= 1) return 'bg-red-100 text-red-700'
    if (dias <= 3) return 'bg-orange-100 text-orange-700'
    if (dias <= 7) return 'bg-amber-100 text-amber-700'
    return 'bg-slate-100 text-slate-700'
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Pendências</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/assistentes">
            Ver todos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {pendentes.length === 0 && aguardandoReport.length === 0 ? (
          <p className="text-center py-8 text-slate-500">
            Nenhuma pendência no momento
          </p>
        ) : (
          <div className="space-y-4">
            {/* Pendentes de Aprovação */}
            {pendentes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Aguardando Aprovação ({pendentes.length})
                </h4>
                <div className="space-y-2">
                  {pendentes.slice(0, 3).map((a) => (
                    <Link
                      key={a.id}
                      href={`/assistentes/${a.id}`}
                      className="block p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">
                            {a.titulo}
                          </p>
                          <p className="text-sm text-slate-500">
                            {a.criador_nome} • {formatarData(a.data_criacao)}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                          Pendente
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Aguardando Report */}
            {aguardandoReport.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Prazo de Report ({aguardandoReport.length})
                </h4>
                <div className="space-y-2">
                  {aguardandoReport.slice(0, 3).map((a) => {
                    const dias = a.data_limite_report
                      ? diasRestantes(a.data_limite_report)
                      : 0
                    return (
                      <Link
                        key={a.id}
                        href={`/assistentes/${a.id}`}
                        className="block p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">
                              {a.titulo}
                            </p>
                            <p className="text-sm text-slate-500">
                              {a.criador_nome} • Prazo:{' '}
                              {a.data_limite_report
                                ? formatarData(a.data_limite_report)
                                : '-'}
                            </p>
                          </div>
                          <Badge className={urgencia(dias)}>
                            {dias > 0 ? `${dias} dias` : 'Vencido'}
                          </Badge>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
