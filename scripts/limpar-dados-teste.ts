import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import * as dotenv from 'dotenv'

// Carrega variáveis de ambiente
dotenv.config({ path: '.env.local' })

// Configuração do cliente JWT
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

async function limparDadosTeste() {
  console.log('🧹 Iniciando limpeza de dados de teste...')

  const doc = new GoogleSpreadsheet(
    process.env.GOOGLE_SHEET_ID!,
    serviceAccountAuth
  )
  await doc.loadInfo()

  const sheet = doc.sheetsByTitle['Assistentes']
  if (!sheet) {
    console.log('❌ Aba "Assistentes" não encontrada')
    return
  }

  const rows = await sheet.getRows()
  console.log(`📊 Total de registros: ${rows.length}`)

  // Encontra o primeiro registro da Beatriz
  let primeiroBeaIndex = -1
  const rowsParaDeletar: number[] = []

  for (let i = 0; i < rows.length; i++) {
    const nome = rows[i].get('criador_nome')

    if (nome === 'Beatriz Nunes') {
      if (primeiroBeaIndex === -1) {
        // Primeiro registro da Beatriz - mantém
        primeiroBeaIndex = i
        console.log(`✅ Mantendo registro: ${rows[i].get('titulo')} (linha ${i + 2})`)
      } else {
        // Registros subsequentes da Beatriz - remove
        console.log(`🗑️  Removendo: ${rows[i].get('titulo')} (linha ${i + 2})`)
        rowsParaDeletar.push(i)
      }
    } else {
      // Todos os outros registros - remove
      console.log(`🗑️  Removendo: ${rows[i].get('titulo')} - ${nome} (linha ${i + 2})`)
      rowsParaDeletar.push(i)
    }
  }

  // Deleta as linhas (de trás para frente para não bagunçar os índices)
  for (let i = rowsParaDeletar.length - 1; i >= 0; i--) {
    await rows[rowsParaDeletar[i]].delete()
  }

  console.log(`\n✨ Limpeza concluída!`)
  console.log(`📝 Registros removidos: ${rowsParaDeletar.length}`)
  console.log(`📋 Registros mantidos: 1 (Beatriz Nunes)`)
}

limparDadosTeste().catch(console.error)
