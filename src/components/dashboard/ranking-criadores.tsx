'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Trophy } from 'lucide-react'

interface RankingCriadoresProps {
  criadores: {
    nome: string
    email: string
    quantidade: number
  }[]
}

export function RankingCriadores({ criadores }: RankingCriadoresProps) {
  const getInitials = (nome: string) => {
    const parts = nome.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return nome.substring(0, 2).toUpperCase()
  }

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return 'text-amber-500'
      case 1:
        return 'text-slate-400'
      case 2:
        return 'text-orange-600'
      default:
        return 'text-slate-300'
    }
  }

  if (criadores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top Criadores
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-slate-500">
          Nenhum criador ainda
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Top Criadores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {criadores.slice(0, 5).map((criador, index) => (
            <div
              key={criador.email}
              className="flex items-center gap-3"
            >
              <span
                className={`text-lg font-bold w-6 text-center ${getMedalColor(index)}`}
              >
                {index + 1}
              </span>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-violet-100 text-violet-600 text-xs">
                  {getInitials(criador.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">
                  {criador.nome}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {criador.email}
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-violet-600">
                  {criador.quantidade}
                </span>
                <p className="text-xs text-slate-500">assistentes</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
