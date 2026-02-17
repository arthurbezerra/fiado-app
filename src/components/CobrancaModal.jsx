import { useState } from 'react'
import { getSettings } from '../lib/store'
import { buildWhatsAppMessage, buildWhatsAppUrl, buildPaymentLink, formatCurrency } from '../lib/utils'

const C = {
  card: '#2A2870', inner: '#1E1C54', teal: '#00C4A7',
  white: '#FFFFFF', dim: 'rgba(255,255,255,0.5)',
  font: "'Nunito', sans-serif",
}

export default function CobrancaModal({ customer, totalAberto, openDebts = [], onClose }) {
  const [linkCopied, setLinkCopied] = useState(false)
  const settings  = getSettings()
  const hasPixKey = Boolean(settings.chavePix)
  const paymentLink = hasPixKey ? buildPaymentLink(customer, totalAberto, settings) : ''
  const message   = buildWhatsAppMessage(customer.nome, totalAberto, openDebts, paymentLink)
  const url       = buildWhatsAppUrl(customer.telefone, message)

  function handleCopyLink() {
    navigator.clipboard.writeText(paymentLink).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 3000)
    })
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        fontFamily: C.font,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.card, borderRadius: '24px 24px 0 0',
          padding: '12px 20px 44px', width: '100%', maxWidth: 430,
          margin: '0 auto', boxSizing: 'border-box',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', margin: '0 auto 20px' }} />

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: C.white }}>Cobrar via WhatsApp</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.dim, fontSize: 26, lineHeight: 1, padding: 0 }}>×</button>
        </div>

        <p style={{ margin: '0 0 20px', fontSize: 14, color: C.dim }}>
          Para <strong style={{ color: C.white }}>{customer.nome}</strong> · {formatCurrency(totalAberto)}
        </p>

        {/* Payment link */}
        {hasPixKey ? (
          <div style={{ background: 'rgba(0,196,167,0.1)', border: '1px solid rgba(0,196,167,0.25)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 800, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Link de pagamento
            </p>
            <p style={{ margin: '0 0 12px', fontSize: 11, color: C.dim, fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.6 }}>
              {paymentLink}
            </p>
            <button
              onClick={handleCopyLink}
              style={{
                width: '100%', border: 'none', borderRadius: 12, padding: '12px',
                background: linkCopied ? '#34D39A' : C.teal, color: '#151347',
                fontFamily: C.font, fontSize: 14, fontWeight: 900, cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {linkCopied ? '✓ Link copiado!' : 'Copiar link'}
            </button>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px 14px', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: C.dim, lineHeight: 1.5 }}>
              💡 Configure sua <a href="/configuracoes" style={{ color: C.teal, fontWeight: 700 }}>Chave Pix</a> para gerar um link de pagamento com QR Code.
            </p>
          </div>
        )}

        {/* Message preview */}
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 800, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Prévia da mensagem
        </p>
        <div style={{ background: C.inner, borderRadius: 14, padding: 16, marginBottom: 20, fontSize: 14, color: C.white, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {message}
        </div>

        {/* WhatsApp button */}
        <a
          href={url} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'block', textAlign: 'center', background: '#25D366',
            borderRadius: 16, padding: '18px', color: '#fff',
            fontFamily: C.font, fontSize: 17, fontWeight: 900,
            textDecoration: 'none', boxShadow: '0 6px 20px rgba(37,211,102,0.3)',
          }}
        >
          Abrir no WhatsApp
        </a>
      </div>
    </div>
  )
}
