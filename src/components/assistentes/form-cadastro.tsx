'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SETORES, COMPLEXIDADE_LABELS } from '@/config/constants'

const formSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  link_gem: z.string().url('Digite uma URL válida'),
  criador_nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  criador_email: z.string().email('Digite um email válido'),
  criador_setor: z.string().min(1, 'Selecione um setor'),
  problema_resolvido: z
    .string()
    .min(10, 'Descreva o problema com mais detalhes'),
  o_que_faz: z.string().min(10, 'Descreva o que o assistente faz'),
  como_usar: z.string().min(10, 'Descreva como usar o assistente'),
  complexidade: z.enum(['BAIXA', 'MEDIA', 'ALTA']),
})

type FormData = z.infer<typeof formSchema>

interface FormCadastroProps {
  onSubmit: (data: FormData) => void
  isLoading?: boolean
}

export function FormCadastro({ onSubmit, isLoading }: FormCadastroProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      link_gem: '',
      criador_nome: '',
      criador_email: '',
      criador_setor: '',
      problema_resolvido: '',
      o_que_faz: '',
      como_usar: '',
      complexidade: 'MEDIA',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações do Assistente */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Assistente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Assistente *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Gerador de Relatórios" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="link_gem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link do Gem *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://gemini.google.com/gem/..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>URL do Gem no Google Gemini</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="complexidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complexidade *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a complexidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(COMPLEXIDADE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Informações do Criador */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Criador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="criador_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Criador *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="criador_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@aja.com.br"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="criador_setor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setor *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SETORES.map((setor) => (
                        <SelectItem key={setor} value={setor}>
                          {setor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Detalhes do Assistente */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="problema_resolvido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problema que Resolve *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva qual problema o assistente resolve..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="o_que_faz"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>O que ele faz *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o que o assistente faz..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="como_usar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Como usar *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instruções de uso do assistente..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => window.history.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Cadastrar Assistente'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
