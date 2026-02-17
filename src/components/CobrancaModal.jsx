import { useState } from 'react'
import { getSettings } from '../lib/store'
import { buildWhatsAppMessage, buildWhatsAppUrl, buildPaymentLink, formatCurrency } from '../lib/utils'

export default function CobrancaModal({ customer, totalAberto, openDebts = [], onClose }) {
  const [linkCopied, setLinkCopied] = useState(false)
  const settings = getSettings()
  const hasPixKey = Boolean(settings.chavePix)

  const paymentLink = hasPixKey ? buildPaymentLink(customer, totalAberto, settings) : ''
  const message = buildWhatsAppMessage(customer.nome, totalAberto, openDebts, paymentLink)
  const url = buildWhatsAppUrl(customer.telefone, message)

  function handleCopyLink() {
    navigator.clipboard.writeText(paymentLink).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 3000)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text">Cobrar via WhatsApp</h3>
            <button onClick={onClose} className="text-text-light hover:text-text text-2xl leading-none">
              &times;
            </button>
          </div>

          <p className="text-sm text-text-light">
            Mensagem para <strong>{customer.nome}</strong> — Total:{' '}
            <strong>{formatCurrency(totalAberto)}</strong>
          </p>

          {/* Payment link */}
          {hasPixKey ? (
            <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-accent uppercase tracking-wide">Link de pagamento</p>
              <p className="text-xs text-text break-all font-mono leading-relaxed">{paymentLink}</p>
              <button
                onClick={handleCopyLink}
                className={`w-full text-xs font-bold py-2 rounded-lg transition-colors ${
                  linkCopied ? 'bg-success text-white' : 'bg-accent hover:bg-accent-hover text-white'
                }`}
              >
                {linkCopied ? '✓ Link copiado!' : 'Copiar link'}
              </button>
            </div>
          ) : (
            <div className="bg-bg rounded-xl p-3 text-xs text-text-light">
              💡 Configure sua chave Pix em{' '}
              <a href="/configuracoes" className="text-accent font-semibold hover:underline">
                Configurações
              </a>{' '}
              para gerar um link de pagamento com QR Code.
            </div>
          )}

          {/* WhatsApp message preview */}
          <div>
            <p className="text-xs font-semibold text-text-light mb-1">Prévia da mensagem</p>
            <div className="bg-bg rounded-xl p-4 text-sm text-text whitespace-pre-wrap leading-relaxed">
              {message}
            </div>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-[#25D366] hover:bg-[#1da851] text-white font-bold py-3 px-4 rounded-xl transition-colors"
          >
            Abrir no WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
