import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { buildPixPayload } from '../lib/pix'
import { formatCurrency } from '../lib/utils'

const BANKS = [
  { name: 'Nubank',       bg: '#8A05BE', text: '#fff',    initial: 'N', url: 'https://nubank.com.br' },
  { name: 'Inter',        bg: '#FF6600', text: '#fff',    initial: 'I', url: 'https://inter.co' },
  { name: 'Itaú',         bg: '#EC7000', text: '#fff',    initial: 'I', url: 'https://www.itau.com.br' },
  { name: 'Bradesco',     bg: '#CC092F', text: '#fff',    initial: 'B', url: 'https://banco.bradesco' },
  { name: 'Caixa',        bg: '#006BB4', text: '#fff',    initial: 'C', url: 'https://www.caixa.gov.br' },
  { name: 'BB',           bg: '#FDCE04', text: '#003082', initial: 'B', url: 'https://www.bb.com.br' },
  { name: 'C6 Bank',      bg: '#242424', text: '#fff',    initial: 'C', url: 'https://www.c6bank.com.br' },
  { name: 'PicPay',       bg: '#21C25E', text: '#fff',    initial: 'P', url: 'https://picpay.com' },
  { name: 'Mercado Pago', bg: '#009EE3', text: '#fff',    initial: 'M', url: 'https://www.mercadopago.com.br' },
]

export default function PagamentoPage() {
  const [params] = useSearchParams()
  const [copied, setCopied] = useState(false)

  const nome   = params.get('nome')   || ''
  const valor  = params.get('valor')  || '0'
  const pix    = params.get('pix')    || ''
  const loja   = params.get('loja')   || 'Loja'
  const cidade = params.get('cidade') || 'Brasil'
  const desc   = params.get('desc')   || ''

  if (!pix || !valor || Number(valor) <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-4">
        <p className="text-text-light text-sm">Link de pagamento inválido.</p>
      </div>
    )
  }

  const pixCode = buildPixPayload({ chavePix: pix, valor, nomeLoja: loja, cidade, descricao: desc })

  function handleCopy() {
    navigator.clipboard.writeText(pixCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    })
  }

  const firstName = nome ? nome.split(' ')[0] : null

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="bg-navy text-white px-4 py-4 text-center">
        <p className="text-xs text-white/50 uppercase tracking-widest mb-0.5">Cobrança de</p>
        <p className="text-xl font-extrabold">{loja}</p>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-4 pb-10">
        {/* Amount */}
        <div className="bg-card rounded-2xl p-6 shadow-sm text-center mt-2">
          {firstName && (
            <p className="text-text-light text-sm mb-2">
              Olá, <strong>{firstName}</strong>! Você tem um saldo em aberto:
            </p>
          )}
          <p className="text-5xl font-extrabold text-danger">{formatCurrency(Number(valor))}</p>
          {desc && <p className="text-xs text-text-light mt-3">{desc}</p>}
        </div>

        {/* Copia e Cola — primary CTA */}
        <div className="bg-card rounded-2xl p-5 shadow-sm space-y-3">
          <div>
            <p className="text-sm font-bold text-text">Pix Copia e Cola</p>
            <p className="text-xs text-text-light mt-0.5">
              Copie o código abaixo e cole em qualquer app de banco em Pix → Copia e Cola
            </p>
          </div>
          <div className="bg-bg rounded-xl p-3 text-xs text-text-light break-all font-mono leading-relaxed select-all">
            {pixCode}
          </div>
          <button
            onClick={handleCopy}
            className={`w-full font-bold py-3.5 rounded-xl transition-colors text-sm ${
              copied ? 'bg-success text-white' : 'bg-accent hover:bg-accent-hover text-white'
            }`}
          >
            {copied ? '✓ Código copiado!' : 'Copiar código Pix'}
          </button>
        </div>

        {/* QR Code */}
        <div className="bg-card rounded-2xl p-5 shadow-sm flex flex-col items-center gap-3">
          <p className="text-sm font-bold text-text">QR Code Pix</p>
          <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-inner">
            <QRCodeSVG value={pixCode} size={180} />
          </div>
          <p className="text-xs text-text-light text-center">
            Escaneie com a câmera do celular ou pelo app do banco
          </p>
        </div>

        {/* Bank links */}
        <div className="bg-card rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-bold text-text mb-1">Abrir meu banco</p>
          <p className="text-xs text-text-light mb-4">
            Acesse o app do seu banco, vá em <strong>Pix → Copia e Cola</strong> e cole o código acima.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {BANKS.map((bank) => (
              <a
                key={bank.name}
                href={bank.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-bg transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-base font-extrabold shadow-sm"
                  style={{ backgroundColor: bank.bg, color: bank.text }}
                >
                  {bank.initial}
                </div>
                <span className="text-xs text-text-light text-center leading-tight">{bank.name}</span>
              </a>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-text-light">
          Pagamento processado com segurança via Pix · Banco Central do Brasil
        </p>
      </main>
    </div>
  )
}
