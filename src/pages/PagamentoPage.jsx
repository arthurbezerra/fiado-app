import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { buildPixPayload } from '../lib/pix'
import { formatCurrency } from '../lib/utils'

const STEPS = [
  { n: '1', text: 'Copie o código abaixo' },
  { n: '2', text: 'Abra o app do seu banco' },
  { n: '3', text: 'Vá em Pix → Pix Copia e Cola' },
  { n: '4', text: 'Cole e confirme o pagamento' },
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
      setTimeout(() => setCopied(false), 4000)
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

        {/* How to pay */}
        <div className="bg-card rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-bold text-text mb-3">Como pagar</p>
          <ol className="space-y-2">
            {STEPS.map((s) => (
              <li key={s.n} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-accent text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                  {s.n}
                </span>
                <span className="text-sm text-text">{s.text}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Copia e Cola — primary CTA */}
        <div className="bg-card rounded-2xl p-5 shadow-sm space-y-3">
          <p className="text-sm font-bold text-text">Código Pix Copia e Cola</p>
          <div className="bg-bg rounded-xl p-3 text-xs text-text-light break-all font-mono leading-relaxed select-all">
            {pixCode}
          </div>
          <button
            onClick={handleCopy}
            className={`w-full font-bold py-4 rounded-xl transition-all text-base ${
              copied
                ? 'bg-success text-white scale-95'
                : 'bg-accent hover:bg-accent-hover text-white'
            }`}
          >
            {copied ? '✓ Código copiado! Agora abra seu banco.' : 'Copiar código Pix'}
          </button>
        </div>

        {/* QR Code — secondary */}
        <div className="bg-card rounded-2xl p-5 shadow-sm flex flex-col items-center gap-3">
          <p className="text-sm font-bold text-text">Ou escaneie o QR Code</p>
          <p className="text-xs text-text-light text-center -mt-1">
            Use a câmera do celular ou a opção de QR Code no app do seu banco.
          </p>
          <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-inner">
            <QRCodeSVG value={pixCode} size={180} />
          </div>
        </div>

        <p className="text-center text-xs text-text-light pb-2">
          Pix é instantâneo e funciona em qualquer banco · Banco Central do Brasil
        </p>

      </main>
    </div>
  )
}
