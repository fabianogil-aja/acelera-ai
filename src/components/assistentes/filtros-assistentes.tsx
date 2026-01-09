'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { STATUS_LABELS, SETORES } from '@/config/constants'
import type { AssistenteStatus } from '@/lib/types'

interface FiltrosAssistentesProps {
  busca: string
  setBusca: (busca: string) => void
  status: string
  setStatus: (status: string) => void
  setor: string
  setSetor: (setor: string) => void
  onLimpar: () => void
}

export function FiltrosAssistentes({
  busca,
  setBusca,
  status,
  setStatus,
  setor,
  setSetor,
  onLimpar,
}: FiltrosAssistentesProps) {
  const statusOptions: { value: AssistenteStatus | ''; label: string }[] = [
    { value: '', label: 'Todos os status' },
    { value: 'PENDENTE', label: STATUS_LABELS.PENDENTE },
    { value: 'APROVADO', label: STATUS_LABELS.APROVADO },
    { value: 'AGUARDANDO_REPORT', label: STATUS_LABELS.AGUARDANDO_REPORT },
    { value: 'CONCLUIDO', label: STATUS_LABELS.CONCLUIDO },
    { value: 'EXPIRADO', label: STATUS_LABELS.EXPIRADO },
    { value: 'REPROVADO', label: STATUS_LABELS.REPROVADO },
  ]

  const temFiltroAtivo = busca || status || setor

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="Buscar por título ou criador..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value || 'all'} value={option.value || 'all'}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={setor} onValueChange={setSetor}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Setor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os setores</SelectItem>
          {SETORES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {temFiltroAtivo && (
        <Button variant="ghost" onClick={onLimpar} className="gap-2">
          <X className="w-4 h-4" />
          Limpar
        </Button>
      )}
    </div>
  )
}
