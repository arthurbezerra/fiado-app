import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { buildPixPayload } from '../lib/pix'
import { formatCurrency } from '../lib/utils'

export default function PagamentoPage() {
  const [params] = useSearchParams()
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const nome   = params.get('nome')   || ''
  const valor  = params.get('valor')  || '0'
  const pix    = params.get('pix')    || ''
  const loja   = params.get('loja')   || 'Loja'
  const cidade = params.get('cidade') || 'Brasil'
  const desc   = params.get('desc')   || ''

  if (!pix || !valor || Number(valor) <= 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f3ee' }}>
        <p style={{ color: '#888', fontSize: 14 }}>Link de pagamento inválido.</p>
      </div>
    )
  }

  const pixCode = buildPixPayload({ chavePix: pix, valor, nomeLoja: loja, cidade, descricao: desc })
  const firstName = nome ? nome.split(' ')[0] : null
  const initials  = loja.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()

  function handleCopy() {
    navigator.clipboard.writeText(pixCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 5000)
    })
  }

  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={styles.avatar}>{initials}</div>
        <p style={styles.headerSub}>Cobrança de</p>
        <p style={styles.headerLoja}>{loja}</p>
      </div>

      {/* ── Amount hero ── */}
      <div style={styles.amountCard}>
        {firstName && (
          <p style={styles.amountGreeting}>
            Oi <strong>{firstName}</strong>, você tem um saldo em aberto 👋
          </p>
        )}
        <p style={styles.amount}>{formatCurrency(Number(valor))}</p>
        {desc && <p style={styles.amountDesc}>{desc}</p>}
      </div>

      {/* ── How-to steps ── */}
      <div style={styles.card}>
        <p style={styles.cardTitle}>Como pagar</p>
        <div style={styles.steps}>
          {[
            'Copie o código Pix abaixo',
            'Abra o app do seu banco',
            'Vá em Pix → Pix Copia e Cola',
            'Cole e confirme',
          ].map((text, i) => (
            <div key={i} style={styles.step}>
              <div style={styles.stepNum}>{i + 1}</div>
              <p style={styles.stepText}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pix code ── */}
      <div style={styles.card}>
        <p style={styles.cardTitle}>Código Pix</p>
        <div
          style={styles.codeBox}
          onClick={() => {
            const sel = window.getSelection()
            const range = document.createRange()
            range.selectNodeContents(document.getElementById('pix-code'))
            sel.removeAllRanges()
            sel.addRange(range)
          }}
        >
          <p id="pix-code" style={styles.codeText}>{pixCode}</p>
        </div>
        <p style={styles.codeTip}>Toque no código para selecionar</p>
      </div>

      {/* ── QR Code toggle ── */}
      <div style={styles.card}>
        <button style={styles.qrToggle} onClick={() => setShowQR(v => !v)}>
          <span>📷 Prefiro escanear o QR Code</span>
          <span style={{ ...styles.qrChevron, transform: showQR ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
        </button>
        {showQR && (
          <div style={styles.qrWrap}>
            <QRCodeSVG value={pixCode} size={180} />
            <p style={styles.qrTip}>Escaneie pelo app do banco ou pela câmera</p>
          </div>
        )}
      </div>

      {/* ── Trust footer ── */}
      <p style={styles.trust}>
        🔒 Pix é instantâneo e seguro · Banco Central do Brasil
      </p>

      {/* ── Spacer for fixed button ── */}
      <div style={{ height: 100 }} />

      {/* ── Sticky CTA ── */}
      <div style={styles.stickyBar}>
        <button
          onClick={handleCopy}
          style={{
            ...styles.ctaButton,
            background: copied ? '#27ae60' : '#32BCAD',
          }}
        >
          {copied ? '✓ Código copiado! Abra seu banco.' : 'Copiar código Pix'}
        </button>
      </div>

    </div>
  )
}

/* ─── Styles ──────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f3ee',
    fontFamily: "'Nunito', sans-serif",
    color: '#1a1a2e',
    maxWidth: 480,
    margin: '0 auto',
    padding: '0 0 24px',
  },

  /* header */
  header: {
    background: '#1a1a2e',
    color: '#fff',
    textAlign: 'center',
    padding: '32px 24px 28px',
    borderRadius: '0 0 28px 28px',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: '#f39c12',
    color: '#fff',
    fontWeight: 900,
    fontSize: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
    letterSpacing: '-0.5px',
  },
  headerSub: {
    margin: 0,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
  },
  headerLoja: {
    margin: '4px 0 0',
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: '-0.3px',
  },

  /* amount */
  amountCard: {
    background: '#fff',
    margin: '20px 16px 0',
    borderRadius: 24,
    padding: '28px 24px',
    textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  amountGreeting: {
    margin: '0 0 12px',
    fontSize: 15,
    color: '#555',
    lineHeight: 1.4,
  },
  amount: {
    margin: 0,
    fontSize: 52,
    fontWeight: 900,
    color: '#e74c3c',
    letterSpacing: '-1.5px',
    lineHeight: 1,
  },
  amountDesc: {
    margin: '12px 0 0',
    fontSize: 13,
    color: '#999',
  },

  /* generic card */
  card: {
    background: '#fff',
    margin: '12px 16px 0',
    borderRadius: 24,
    padding: '22px 20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    margin: '0 0 16px',
    fontSize: 13,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#999',
  },

  /* steps */
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  stepNum: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#fff3e0',
    color: '#f39c12',
    fontWeight: 900,
    fontSize: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepText: {
    margin: 0,
    fontSize: 15,
    fontWeight: 600,
    color: '#1a1a2e',
  },

  /* pix code */
  codeBox: {
    background: '#f5f3ee',
    borderRadius: 14,
    padding: '14px 16px',
    cursor: 'text',
    userSelect: 'all',
  },
  codeText: {
    margin: 0,
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#555',
    wordBreak: 'break-all',
    lineHeight: 1.6,
    userSelect: 'all',
  },
  codeTip: {
    margin: '8px 0 0',
    fontSize: 11,
    color: '#bbb',
    textAlign: 'center',
  },

  /* QR toggle */
  qrToggle: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
    fontSize: 15,
    fontWeight: 700,
    color: '#1a1a2e',
  },
  qrChevron: {
    fontSize: 18,
    transition: 'transform 0.2s',
    color: '#aaa',
  },
  qrWrap: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  qrTip: {
    margin: 0,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },

  /* trust */
  trust: {
    textAlign: 'center',
    fontSize: 12,
    color: '#bbb',
    margin: '20px 16px 0',
    lineHeight: 1.5,
  },

  /* sticky button */
  stickyBar: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
    padding: '12px 16px 24px',
    background: 'linear-gradient(to top, #f5f3ee 70%, transparent)',
  },
  ctaButton: {
    width: '100%',
    border: 'none',
    borderRadius: 18,
    padding: '18px 24px',
    color: '#fff',
    fontFamily: "'Nunito', sans-serif",
    fontSize: 17,
    fontWeight: 900,
    cursor: 'pointer',
    transition: 'background 0.3s, transform 0.1s',
    letterSpacing: '-0.2px',
    boxShadow: '0 4px 20px rgba(50,188,173,0.35)',
  },
}
