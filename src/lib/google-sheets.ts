import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { v4 as uuidv4 } from 'uuid'
import { addDays, parseISO, differenceInDays } from 'date-fns'
import type {
  Assistente,
  AssistenteStatus,
  CriarAssistenteInput,
  RegistrarReportInput,
  FiltrosAssistente,
  Metricas,
  Relatorio,
  RelatorioItem,
  Alerta,
} from './types'
import {
  CREDITO_CRIACAO,
  CREDITO_REPORT,
  PRAZO_REPORT_DIAS,
} from '@/config/constants'

// Configuração do cliente JWT para Google Sheets API
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

// Inicializa o documento do Google Sheets
async function getDoc(): Promise<GoogleSpreadsheet> {
  const doc = new GoogleSpreadsheet(
    process.env.GOOGLE_SHEET_ID!,
    serviceAccountAuth
  )
  await doc.loadInfo()
  return doc
}

// Obtém a aba de assistentes
async function getAssistentesSheet() {
  const doc = await getDoc()
  let sheet = doc.sheetsByTitle['Assistentes']

  // Se a aba não existir, cria com os headers
  if (!sheet) {
    sheet = await doc.addSheet({
      title: 'Assistentes',
      headerValues: [
        'id',
        'titulo',
        'link_gem',
        'criador_nome',
        'criador_email',
        'criador_setor',
        'data_criacao',
        'data_aprovacao',
        'data_report',
        'data_limite_report',
        'status',
        'problema_resolvido',
        'o_que_faz',
        'como_usar',
        'complexidade',
        'report_resultado',
        'report_melhoria',
        'report_aprendizados',
        'credito_criacao',
        'credito_report',
        'credito_total',
        'notificacao_enviada_7d',
        'notificacao_enviada_3d',
        'notificacao_enviada_1d',
        'motivo_reprovacao',
      ],
    })
  }

  return sheet
}

// Converte uma linha do Sheets para o tipo Assistente
function rowToAssistente(row: GoogleSpreadsheetRow): Assistente {
  return {
    id: row.get('id'),
    titulo: row.get('titulo'),
    link_gem: row.get('link_gem'),
    criador_nome: row.get('criador_nome'),
    criador_email: row.get('criador_email'),
    criador_setor: row.get('criador_setor'),
    data_criacao: row.get('data_criacao'),
    data_aprovacao: row.get('data_aprovacao') || null,
    data_report: row.get('data_report') || null,
    data_limite_report: row.get('data_limite_report') || null,
    status: row.get('status') as AssistenteStatus,
    problema_resolvido: row.get('problema_resolvido'),
    o_que_faz: row.get('o_que_faz'),
    como_usar: row.get('como_usar'),
    complexidade: row.get('complexidade') as 'BAIXA' | 'MEDIA' | 'ALTA',
    report_resultado: row.get('report_resultado') || null,
    report_melhoria: row.get('report_melhoria') || null,
    report_aprendizados: row.get('report_aprendizados') || null,
    credito_criacao: parseFloat(row.get('credito_criacao') || '0'),
    credito_report: parseFloat(row.get('credito_report') || '0'),
    credito_total: parseFloat(row.get('credito_total') || '0'),
    notificacao_enviada_7d: row.get('notificacao_enviada_7d') === 'true',
    notificacao_enviada_3d: row.get('notificacao_enviada_3d') === 'true',
    notificacao_enviada_1d: row.get('notificacao_enviada_1d') === 'true',
    motivo_reprovacao: row.get('motivo_reprovacao') || undefined,
  }
}

// ==================== CRUD de Assistentes ====================

// Lista todos os assistentes com filtros opcionais
export async function listarAssistentes(
  filtros?: FiltrosAssistente
): Promise<Assistente[]> {
  const sheet = await getAssistentesSheet()
  const rows = await sheet.getRows()

  let assistentes = rows.map(rowToAssistente)

  // Aplica filtros
  if (filtros) {
    if (filtros.status) {
      assistentes = assistentes.filter((a) => a.status === filtros.status)
    }
    if (filtros.criador_email) {
      assistentes = assistentes.filter(
        (a) => a.criador_email === filtros.criador_email
      )
    }
    if (filtros.setor) {
      assistentes = assistentes.filter((a) => a.criador_setor === filtros.setor)
    }
    if (filtros.periodo_inicio) {
      assistentes = assistentes.filter(
        (a) => a.data_criacao >= filtros.periodo_inicio!
      )
    }
    if (filtros.periodo_fim) {
      assistentes = assistentes.filter(
        (a) => a.data_criacao <= filtros.periodo_fim!
      )
    }
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase()
      assistentes = assistentes.filter(
        (a) =>
          a.titulo.toLowerCase().includes(busca) ||
          a.criador_nome.toLowerCase().includes(busca)
      )
    }
  }

  // Ordena por data de criação (mais recentes primeiro)
  assistentes.sort(
    (a, b) =>
      new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
  )

  return assistentes
}

// Busca um assistente por ID
export async function buscarAssistentePorId(
  id: string
): Promise<Assistente | null> {
  const sheet = await getAssistentesSheet()
  const rows = await sheet.getRows()

  const row = rows.find((r) => r.get('id') === id)
  if (!row) return null

  return rowToAssistente(row)
}

// Cria um novo assistente
export async function criarAssistente(
  dados: CriarAssistenteInput
): Promise<Assistente> {
  const sheet = await getAssistentesSheet()

  const novoAssistente: Assistente = {
    id: uuidv4(),
    titulo: dados.titulo,
    link_gem: dados.link_gem,
    criador_nome: dados.criador_nome,
    criador_email: dados.criador_email,
    criador_setor: dados.criador_setor,
    data_criacao: dados.data_criacao || new Date().toISOString(),
    data_aprovacao: null,
    data_report: null,
    data_limite_report: null,
    status: 'PENDENTE',
    problema_resolvido: dados.problema_resolvido,
    o_que_faz: dados.o_que_faz,
    como_usar: dados.como_usar,
    complexidade: dados.complexidade,
    report_resultado: null,
    report_melhoria: null,
    report_aprendizados: null,
    credito_criacao: 0,
    credito_report: 0,
    credito_total: 0,
    notificacao_enviada_7d: false,
    notificacao_enviada_3d: false,
    notificacao_enviada_1d: false,
  }

  await sheet.addRow({
    id: novoAssistente.id,
    titulo: novoAssistente.titulo,
    link_gem: novoAssistente.link_gem,
    criador_nome: novoAssistente.criador_nome,
    criador_email: novoAssistente.criador_email,
    criador_setor: novoAssistente.criador_setor,
    data_criacao: novoAssistente.data_criacao,
    data_aprovacao: '',
    data_report: '',
    data_limite_report: '',
    status: novoAssistente.status,
    problema_resolvido: novoAssistente.problema_resolvido,
    o_que_faz: novoAssistente.o_que_faz,
    como_usar: novoAssistente.como_usar,
    complexidade: novoAssistente.complexidade,
    report_resultado: '',
    report_melhoria: '',
    report_aprendizados: '',
    credito_criacao: '0',
    credito_report: '0',
    credito_total: '0',
    notificacao_enviada_7d: 'false',
    notificacao_enviada_3d: 'false',
    notificacao_enviada_1d: 'false',
    motivo_reprovacao: '',
  })

  return novoAssistente
}

// Aprova um assistente
export async function aprovarAssistente(id: string): Promise<Assistente> {
  const sheet = await getAssistentesSheet()
  const rows = await sheet.getRows()

  const row = rows.find((r) => r.get('id') === id)
  if (!row) {
    throw new Error('Assistente não encontrado')
  }

  const status = row.get('status')
  if (status !== 'PENDENTE') {
    throw new Error('Apenas assistentes pendentes podem ser aprovados')
  }

  const dataAprovacao = new Date().toISOString()
  const dataLimiteReport = addDays(new Date(), PRAZO_REPORT_DIAS).toISOString()

  row.set('status', 'APROVADO')
  row.set('data_aprovacao', dataAprovacao)
  row.set('data_limite_report', dataLimiteReport)
  row.set('credito_criacao', CREDITO_CRIACAO.toString())
  row.set('credito_total', CREDITO_CRIACAO.toString())

  await row.save()

  return rowToAssistente(row)
}

// Reprova um assistente
export async function reprovarAssistente(
  id: string,
  motivo?: string
): Promise<Assistente> {
  const sheet = await getAssistentesSheet()
  const rows = await sheet.getRows()

  const row = rows.find((r) => r.get('id') === id)
  if (!row) {
    throw new Error('Assistente não encontrado')
  }

  const status = row.get('status')
  if (status !== 'PENDENTE') {
    throw new Error('Apenas assistentes pendentes podem ser reprovados')
  }

  row.set('status', 'REPROVADO')
  if (motivo) {
    row.set('motivo_reprovacao', motivo)
  }

  await row.save()

  return rowToAssistente(row)
}

// Registra um report de impacto
export async function registrarReport(
  id: string,
  dados: RegistrarReportInput
): Promise<Assistente> {
  const sheet = await getAssistentesSheet()
  const rows = await sheet.getRows()

  const row = rows.find((r) => r.get('id') === id)
  if (!row) {
    throw new Error('Assistente não encontrado')
  }

  const status = row.get('status')
  if (status !== 'APROVADO' && status !== 'AGUARDANDO_REPORT') {
    throw new Error(
      'Report só pode ser registrado para assistentes aprovados ou aguardando report'
    )
  }

  const dataLimiteReport = row.get('data_limite_report')
  const dataReport = new Date().toISOString()

  // Verifica se está dentro do prazo
  let creditoReport = 0
  if (dataLimiteReport && new Date(dataReport) <= new Date(dataLimiteReport)) {
    creditoReport = CREDITO_REPORT
  }

  const creditoCriacao = parseFloat(row.get('credito_criacao') || '0')
  const creditoTotal = creditoCriacao + creditoReport

  row.set('status', 'CONCLUIDO')
  row.set('data_report', dataReport)
  row.set('report_resultado', dados.report_resultado)
  row.set('report_melhoria', dados.report_melhoria)
  row.set('report_aprendizados', dados.report_aprendizados)
  row.set('credito_report', creditoReport.toString())
  row.set('credito_total', creditoTotal.toString())

  await row.save()

  return rowToAssistente(row)
}

// Atualiza status para AGUARDANDO_REPORT após 24h de aprovação
export async function atualizarStatusAguardandoReport(): Promise<number> {
  const sheet = await getAssistentesSheet()
  const rows = await sheet.getRows()

  let atualizados = 0
  const agora = new Date()

  for (const row of rows) {
    const status = row.get('status')
    const dataAprovacao = row.get('data_aprovacao')

    if (status === 'APROVADO' && dataAprovacao) {
      const horasDesdeAprovacao =
        (agora.getTime() - new Date(dataAprovacao).getTime()) / (1000 * 60 * 60)

      if (horasDesdeAprovacao >= 24) {
        row.set('status', 'AGUARDANDO_REPORT')
        await row.save()
        atualizados++
      }
    }
  }

  return atualizados
}

// Verifica e atualiza assistentes expirados
export async function verificarExpirados(): Promise<number> {
  const sheet = await getAssistentesSheet()
  const rows = await sheet.getRows()

  let expirados = 0
  const agora = new Date()

  for (const row of rows) {
    const status = row.get('status')
    const dataLimiteReport = row.get('data_limite_report')

    if (status === 'AGUARDANDO_REPORT' && dataLimiteReport) {
      if (agora > new Date(dataLimiteReport)) {
        row.set('status', 'EXPIRADO')
        await row.save()
        expirados++
      }
    }
  }

  return expirados
}

// ==================== Métricas ====================

export async function obterMetricas(): Promise<Metricas> {
  const assistentes = await listarAssistentes()

  const agora = new Date()
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
  const inicioSemana = new Date(agora)
  inicioSemana.setDate(agora.getDate() - agora.getDay())

  const total = assistentes.length
  const pendentes = assistentes.filter((a) => a.status === 'PENDENTE').length
  const aguardandoReport = assistentes.filter(
    (a) => a.status === 'AGUARDANDO_REPORT'
  ).length

  const aprovados = assistentes.filter(
    (a) =>
      a.status === 'APROVADO' ||
      a.status === 'AGUARDANDO_REPORT' ||
      a.status === 'CONCLUIDO' ||
      a.status === 'EXPIRADO'
  ).length
  const concluidos = assistentes.filter((a) => a.status === 'CONCLUIDO').length

  const taxaConclusao = aprovados > 0 ? (concluidos / aprovados) * 100 : 0

  const creditadoMes = assistentes
    .filter((a) => {
      const dataAprovacao = a.data_aprovacao
        ? new Date(a.data_aprovacao)
        : null
      return dataAprovacao && dataAprovacao >= inicioMes
    })
    .reduce((acc, a) => acc + a.credito_total, 0)

  const aPagarSemana = assistentes
    .filter((a) => {
      const dataAprovacao = a.data_aprovacao
        ? new Date(a.data_aprovacao)
        : null
      return dataAprovacao && dataAprovacao >= inicioSemana && a.credito_total > 0
    })
    .reduce((acc, a) => acc + a.credito_total, 0)

  return {
    total_assistentes: total,
    aguardando_aprovacao: pendentes,
    aguardando_report: aguardandoReport,
    taxa_conclusao: Math.round(taxaConclusao * 10) / 10,
    total_creditado_mes: creditadoMes,
    total_a_pagar_semana: aPagarSemana,
  }
}

// ==================== Relatórios ====================

export async function gerarRelatorio(
  periodoInicio: string,
  periodoFim: string
): Promise<Relatorio> {
  const assistentes = await listarAssistentes()

  // Filtra assistentes do período com crédito > 0
  const assistentesPeriodo = assistentes.filter((a) => {
    const dataAprovacao = a.data_aprovacao ? new Date(a.data_aprovacao) : null
    return (
      dataAprovacao &&
      dataAprovacao >= new Date(periodoInicio) &&
      dataAprovacao <= new Date(periodoFim) &&
      a.credito_total > 0
    )
  })

  // Agrupa por colaborador
  const porColaborador = new Map<string, RelatorioItem>()

  for (const a of assistentesPeriodo) {
    const email = a.criador_email
    const item = porColaborador.get(email) || {
      colaborador_nome: a.criador_nome,
      colaborador_email: email,
      quantidade_assistentes: 0,
      credito_criacao_total: 0,
      credito_report_total: 0,
      credito_total: 0,
      assistentes: [],
    }

    item.quantidade_assistentes++
    item.credito_criacao_total += a.credito_criacao
    item.credito_report_total += a.credito_report
    item.credito_total += a.credito_total
    item.assistentes.push({
      id: a.id,
      titulo: a.titulo,
      credito_criacao: a.credito_criacao,
      credito_report: a.credito_report,
    })

    porColaborador.set(email, item)
  }

  const itens = Array.from(porColaborador.values()).sort(
    (a, b) => b.credito_total - a.credito_total
  )
  const totalGeral = itens.reduce((acc, i) => acc + i.credito_total, 0)

  return {
    periodo_inicio: periodoInicio,
    periodo_fim: periodoFim,
    itens,
    total_geral: totalGeral,
  }
}

// ==================== Alertas ====================

export async function obterAlertasPrazo(): Promise<Alerta[]> {
  const assistentes = await listarAssistentes({ status: 'AGUARDANDO_REPORT' })
  const alertas: Alerta[] = []
  const agora = new Date()

  for (const a of assistentes) {
    if (!a.data_limite_report) continue

    const diasRestantes = differenceInDays(
      parseISO(a.data_limite_report),
      agora
    )

    if (diasRestantes <= 7 && diasRestantes > 0) {
      alertas.push({
        id: `alerta-${a.id}-${diasRestantes}d`,
        tipo: 'PRAZO_PROXIMO',
        assistente_id: a.id,
        assistente_titulo: a.titulo,
        criador_nome: a.criador_nome,
        mensagem: `Faltam ${diasRestantes} dia(s) para o prazo do report`,
        data: agora.toISOString(),
        lido: false,
      })
    }
  }

  // Adiciona assistentes pendentes como alertas de nova submissão
  const pendentes = await listarAssistentes({ status: 'PENDENTE' })
  for (const a of pendentes) {
    alertas.push({
      id: `alerta-pendente-${a.id}`,
      tipo: 'NOVA_SUBMISSAO',
      assistente_id: a.id,
      assistente_titulo: a.titulo,
      criador_nome: a.criador_nome,
      mensagem: 'Novo assistente aguardando aprovação',
      data: a.data_criacao,
      lido: false,
    })
  }

  // Ordena por data (mais recentes primeiro)
  alertas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  return alertas
}
