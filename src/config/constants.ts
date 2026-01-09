// Valores de bonificação
export const CREDITO_CRIACAO = 15 // R$15 ao aprovar
export const CREDITO_REPORT = 35 // R$35 se report em até 15 dias

// Prazos
export const PRAZO_REPORT_DIAS = 15 // 15 dias para enviar report após aprovação

// Dias para alertas
export const DIAS_ALERTA = [7, 3, 1] as const

// Labels de status
export const STATUS_LABELS: Record<string, string> = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  AGUARDANDO_REPORT: 'Aguardando Report',
  CONCLUIDO: 'Concluído',
  EXPIRADO: 'Expirado',
  REPROVADO: 'Reprovado',
}

// Cores de status (para badges e gráficos)
export const STATUS_COLORS: Record<string, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  APROVADO: 'bg-blue-100 text-blue-800 border-blue-200',
  AGUARDANDO_REPORT: 'bg-orange-100 text-orange-800 border-orange-200',
  CONCLUIDO: 'bg-green-100 text-green-800 border-green-200',
  EXPIRADO: 'bg-red-100 text-red-800 border-red-200',
  REPROVADO: 'bg-gray-100 text-gray-800 border-gray-200',
}

// Cores para gráficos (Recharts)
export const CHART_COLORS = {
  PENDENTE: '#fbbf24',
  APROVADO: '#3b82f6',
  AGUARDANDO_REPORT: '#f97316',
  CONCLUIDO: '#22c55e',
  EXPIRADO: '#ef4444',
  REPROVADO: '#6b7280',
}

// Labels de complexidade
export const COMPLEXIDADE_LABELS: Record<string, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
}

// Labels de tipo de alerta
export const ALERTA_LABELS: Record<string, string> = {
  NOVA_SUBMISSAO: 'Nova Submissão',
  PRAZO_PROXIMO: 'Prazo Próximo',
  REPORT_RECEBIDO: 'Report Recebido',
  EXPIRADO: 'Expirado',
}

// Setores da empresa (exemplo)
export const SETORES = [
  'Tecnologia',
  'Marketing',
  'Vendas',
  'Operações',
  'Financeiro',
  'RH',
  'Jurídico',
  'Atendimento',
  'Produto',
  'Design',
]

// Navegação do sistema
export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/assistentes', label: 'Assistentes', icon: 'Bot' },
  { href: '/relatorios', label: 'Relatórios', icon: 'FileText' },
  { href: '/inbox', label: 'Inbox', icon: 'Inbox' },
]
