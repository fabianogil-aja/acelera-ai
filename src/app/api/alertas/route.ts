import { NextResponse } from 'next/server'
import { obterAlertasPrazo } from '@/lib/google-sheets'

// GET /api/alertas - Lista alertas e pendências
export async function GET() {
  try {
    const alertas = await obterAlertasPrazo()

    // Conta por tipo
    const contagemPorTipo = {
      NOVA_SUBMISSAO: 0,
      PRAZO_PROXIMO: 0,
      REPORT_RECEBIDO: 0,
      EXPIRADO: 0,
    }

    for (const alerta of alertas) {
      contagemPorTipo[alerta.tipo]++
    }

    return NextResponse.json({
      success: true,
      data: alertas,
      meta: {
        total: alertas.length,
        por_tipo: contagemPorTipo,
      },
    })
  } catch (error) {
    console.error('Erro ao obter alertas:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao obter alertas',
      },
      { status: 500 }
    )
  }
}
