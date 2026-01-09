'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, MoreHorizontal, Check, X, FileText, ExternalLink } from 'lucide-react'
import type { Assistente } from '@/lib/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/config/constants'

interface TabelaAssistentesProps {
  assistentes: Assistente[]
  onAprovar?: (id: string) => void
  onReprovar?: (id: string) => void
  onRegistrarReport?: (id: string) => void
}

export function TabelaAssistentes({
  assistentes,
  onAprovar,
  onReprovar,
  onRegistrarReport,
}: TabelaAssistentesProps) {
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

  if (assistentes.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p className="text-lg font-medium">Nenhum assistente encontrado</p>
        <p className="text-sm">Cadastre um novo assistente ou ajuste os filtros</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Criador</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data Criação</TableHead>
            <TableHead className="text-right">Crédito</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assistentes.map((assistente) => (
            <TableRow key={assistente.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{assistente.titulo}</span>
                  <a
                    href={assistente.link_gem}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-violet-600 hover:underline flex items-center gap-1"
                  >
                    Ver Gem <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{assistente.criador_nome}</span>
                  <span className="text-xs text-slate-500">
                    {assistente.criador_setor}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={STATUS_COLORS[assistente.status]}
                >
                  {STATUS_LABELS[assistente.status]}
                </Badge>
              </TableCell>
              <TableCell>{formatarData(assistente.data_criacao)}</TableCell>
              <TableCell className="text-right font-medium">
                {formatarMoeda(assistente.credito_total)}
              </TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/assistentes/${assistente.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {assistente.status === 'PENDENTE' && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onAprovar?.(assistente.id)}
                          className="text-green-600"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Aprovar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onReprovar?.(assistente.id)}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reprovar
                        </DropdownMenuItem>
                      </>
                    )}
                    {(assistente.status === 'APROVADO' ||
                      assistente.status === 'AGUARDANDO_REPORT') && (
                      <DropdownMenuItem
                        onClick={() => onRegistrarReport?.(assistente.id)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Registrar Report
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
