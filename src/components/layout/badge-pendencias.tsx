'use client'

import { useEffect, useState } from 'react'

interface Contagem {
  pendentes: number
  aguardandoReport: number
}

export function BadgePendencias() {
  const [contagem, setContagem] = useState<Contagem>({
    pendentes: 0,
    aguardandoReport: 0,
  })

  useEffect(() => {
    async function fetchContagem() {
      try {
        const response = await fetch('/api/alertas')
        const data = await response.json()

        if (data.success) {
          setContagem({
            pendentes: data.meta.por_tipo.NOVA_SUBMISSAO || 0,
            aguardandoReport: data.meta.por_tipo.PRAZO_PROXIMO || 0,
          })
        }
      } catch (error) {
        console.error('Erro ao buscar contagem:', error)
      }
    }

    fetchContagem()
    // Atualiza a cada 60 segundos
    const interval = setInterval(fetchContagem, 60000)
    return () => clearInterval(interval)
  }, [])

  const total = contagem.pendentes + contagem.aguardandoReport

  if (total === 0) return null

  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
      {total > 99 ? '99+' : total}
    </span>
  )
}
