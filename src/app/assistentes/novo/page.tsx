'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormCadastro } from '@/components/assistentes/form-cadastro'
import { toast } from 'sonner'
import Link from 'next/link'

export default function NovoAssistentePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: {
    titulo: string
    link_gem: string
    criador_nome: string
    criador_email: string
    criador_setor: string
    problema_resolvido: string
    o_que_faz: string
    como_usar: string
    complexidade: 'BAIXA' | 'MEDIA' | 'ALTA'
  }) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/assistentes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Assistente cadastrado com sucesso!')
        router.push('/assistentes')
      } else {
        toast.error(result.error || 'Erro ao cadastrar assistente')
      }
    } catch {
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/assistentes">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Novo Assistente</h1>
          <p className="text-slate-500">Cadastre um novo assistente de IA</p>
        </div>
      </div>

      {/* Formulário */}
      <div className="max-w-3xl">
        <FormCadastro onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  )
}
