// Status possíveis de um assistente
export type AssistenteStatus =
  | 'PENDENTE'
  | 'APROVADO'
  | 'AGUARDANDO_REPORT'
  | 'CONCLUIDO'
  | 'EXPIRADO'
  | 'REPROVADO'

// Complexidade do assistente
export type Complexidade = 'BAIXA' | 'MEDIA' | 'ALTA'

// Interface principal do Assistente
export interface Assistente {
  id: string
  titulo: string
  link_gem: string
  criador_nome: string
  criador_email: string
  criador_setor: string
  data_criacao: string // ISO date string
  data_aprovacao: string | null
  data_report: string | null
  data_limite_report: string | null
  status: AssistenteStatus
  problema_resolvido: string
  o_que_faz: string
  como_usar: string
  complexidade: Complexidade
  report_resultado: string | null
  report_melhoria: string | null
  report_aprendizados: string | null
  credito_criacao: number
  credito_report: number
  credito_total: number
  notificacao_enviada_7d: boolean
  notificacao_enviada_3d: boolean
  notificacao_enviada_1d: boolean
  motivo_reprovacao?: string
}

// Dados para criar um novo assistente
export interface CriarAssistenteInput {
  titulo: string
  link_gem: string
  criador_nome: string
  criador_email: string
  criador_setor: string
  data_criacao?: string
  problema_resolvido: string
  o_que_faz: string
  como_usar: string
  complexidade: Complexidade
}

// Dados para registrar um report
export interface RegistrarReportInput {
  report_resultado: string
  report_melhoria: string
  report_aprendizados: string
}

// Interface para métricas do dashboard
export interface Metricas {
  total_assistentes: number
  aguardando_aprovacao: number
  aguardando_report: number
  taxa_conclusao: number // porcentagem
  total_creditado_mes: number
  total_a_pagar_semana: number
}

// Interface para métricas de gráficos
export interface MetricasGraficos {
  assistentes_por_status: {
    status: AssistenteStatus
    quantidade: number
  }[]
  criacoes_por_semana: {
    semana: string
    quantidade: number
  }[]
  criadores_ativos: {
    nome: string
    email: string
    quantidade: number
  }[]
  taxa_report_por_semana: {
    semana: string
    taxa: number
  }[]
}

// Interface para item do relatório
export interface RelatorioItem {
  colaborador_nome: string
  colaborador_email: string
  quantidade_assistentes: number
  credito_criacao_total: number
  credito_report_total: number
  credito_total: number
  assistentes: {
    id: string
    titulo: string
    credito_criacao: number
    credito_report: number
  }[]
}

// Interface para relatório completo
export interface Relatorio {
  periodo_inicio: string
  periodo_fim: string
  itens: RelatorioItem[]
  total_geral: number
}

// Tipo de alerta
export type TipoAlerta =
  | 'NOVA_SUBMISSAO'
  | 'PRAZO_PROXIMO'
  | 'REPORT_RECEBIDO'
  | 'EXPIRADO'

// Interface para alertas
export interface Alerta {
  id: string
  tipo: TipoAlerta
  assistente_id: string
  assistente_titulo: string
  criador_nome: string
  mensagem: string
  data: string
  lido: boolean
}

// Filtros para listagem
export interface FiltrosAssistente {
  status?: AssistenteStatus
  criador_email?: string
  setor?: string
  periodo_inicio?: string
  periodo_fim?: string
  busca?: string
}

// Resposta paginada
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  pagina: number
  por_pagina: number
  total_paginas: number
}

// Timeline de eventos
export interface EventoTimeline {
  tipo: 'CRIADO' | 'APROVADO' | 'REPROVADO' | 'REPORT_REGISTRADO' | 'EXPIRADO' | 'ALERTA_ENVIADO'
  data: string
  descricao: string
}
