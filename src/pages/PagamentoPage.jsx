import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { buildPixPayload } from '../lib/pix'
import { formatCurrency } from '../lib/utils'

const C = {
  bg:       '#1E1C54',
  card:     '#2A2870',
  cardAlt:  '#252362',
  teal:     '#00C4A7',
  tealDark: '#00A98F',
  white:    '#FFFFFF',
  dim:      'rgba(255,255,255,0.55)',
  dimMore:  'rgba(255,255,255,0.25)',
  danger:   '#FF6B6B',
}

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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
        <p style={{ color: C.dim, fontSize: 14, fontFamily: 'Nunito, sans-serif' }}>Link de pagamento inválido.</p>
      </div>
    )
  }

  const pixCode   = buildPixPayload({ chavePix: pix, valor, nomeLoja: loja, cidade, descricao: desc })
  const firstName = nome ? nome.split(' ')[0] : null

  function handleCopy() {
    navigator.clipboard.writeText(pixCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 5000)
    })
  }

  function selectCode() {
    const el = document.getElementById('pix-code')
    if (!el) return
    const sel = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(el)
    sel.removeAllRanges()
    sel.addRange(range)
  }

  return (
    <div style={s.page}>

      {/* ── Store header ── */}
      <div style={s.header}>
        <span style={s.emoji}>🏪</span>
        <p style={s.lojaLabel}>Cobrança de</p>
        <p style={s.lojaName}>{loja}</p>
      </div>

      {/* ── Amount hero ── */}
      <div style={s.amountBlock}>
        {firstName && (
          <p style={s.greeting}>Oi, <strong style={{ color: C.white }}>{firstName}</strong> 👋</p>
        )}
        <p style={s.amountLabel}>Valor a pagar</p>
        <p style={s.amount}>{formatCurrency(Number(valor))}</p>
        {desc && <p style={s.desc}>{desc}</p>}
      </div>

      {/* ── Divider ── */}
      <div style={s.divider} />

      {/* ── Steps ── */}
      <div style={s.section}>
        <p style={s.sectionTitle}>Como pagar</p>
        <div style={s.steps}>
          {[
            ['1', 'Copie o código Pix abaixo'],
            ['2', 'Abra o app do seu banco'],
            ['3', 'Pix → Pix Copia e Cola'],
            ['4', 'Cole e confirme o pagamento'],
          ].map(([n, text]) => (
            <div key={n} style={s.step}>
              <div style={s.stepNum}>{n}</div>
              <p style={s.stepText}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pix code ── */}
      <div style={s.section}>
        <p style={s.sectionTitle}>Código Pix</p>
        <div style={s.codeCard} onClick={selectCode}>
          <p id="pix-code" style={s.codeText}>{pixCode}</p>
          <p style={s.codeTap}>toque para selecionar</p>
        </div>
      </div>

      {/* ── QR toggle ── */}
      <div style={s.section}>
        <button style={s.qrBtn} onClick={() => setShowQR(v => !v)}>
          <span style={s.qrBtnText}>📷 Prefiro escanear o QR Code</span>
          <span style={{ ...s.chevron, transform: showQR ? 'rotate(180deg)' : 'rotate(0)' }}>›</span>
        </button>

        {showQR && (
          <div style={s.qrWrap}>
            <div style={s.qrBox}>
              <QRCodeSVG value={pixCode} size={176} fgColor={C.bg} bgColor="#FFFFFF" />
            </div>
            <p style={s.qrTip}>Escaneie pelo app do banco ou pela câmera</p>
          </div>
        )}
      </div>

      {/* ── Trust line ── */}
      <p style={s.trust}>🔒 Pix seguro · Banco Central do Brasil</p>

      {/* ── Spacer ── */}
      <div style={{ height: 110 }} />

      {/* ── Sticky CTA ── */}
      <div style={s.stickyBar}>
        <button
          onClick={handleCopy}
          style={{ ...s.ctaBtn, background: copied ? '#27ae60' : C.teal }}
          onMouseEnter={e => !copied && (e.currentTarget.style.background = C.tealDark)}
          onMouseLeave={e => !copied && (e.currentTarget.style.background = C.teal)}
        >
          {copied
            ? '✓  Copiado! Agora abra seu banco.'
            : 'Copiar código Pix'}
        </button>
      </div>

    </div>
  )
}

/* ─── Styles ─────────────────────────────────────────────── */
const s = {
  page: {
    minHeight: '100vh',
    background: C.bg,
    fontFamily: "'Nunito', sans-serif",
    color: C.white,
    maxWidth: 480,
    margin: '0 auto',
  },

  /* header */
  header: {
    textAlign: 'center',
    padding: '48px 24px 28px',
  },
  emoji: {
    fontSize: 48,
    display: 'block',
    marginBottom: 12,
    lineHeight: 1,
  },
  lojaLabel: {
    margin: 0,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: C.dim,
  },
  lojaName: {
    margin: '6px 0 0',
    fontSize: 26,
    fontWeight: 900,
    letterSpacing: '-0.5px',
    color: C.white,
  },

  /* amount */
  amountBlock: {
    textAlign: 'center',
    padding: '8px 24px 36px',
  },
  greeting: {
    margin: '0 0 4px',
    fontSize: 16,
    fontWeight: 600,
    color: C.dim,
  },
  amountLabel: {
    margin: '0 0 8px',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: C.dimMore,
  },
  amount: {
    margin: 0,
    fontSize: 56,
    fontWeight: 900,
    letterSpacing: '-2px',
    lineHeight: 1,
    color: C.white,
  },
  desc: {
    margin: '14px 0 0',
    fontSize: 14,
    color: C.dim,
  },

  /* divider */
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.08)',
    margin: '0 24px',
  },

  /* sections */
  section: {
    padding: '24px 20px 0',
  },
  sectionTitle: {
    margin: '0 0 14px',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: C.dimMore,
  },

  /* steps */
  steps: {
    background: C.card,
    borderRadius: 20,
    overflow: 'hidden',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '16px 20px',
    borderBottom: `1px solid rgba(255,255,255,0.06)`,
  },
  stepNum: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: C.teal,
    color: C.bg,
    fontWeight: 900,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepText: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: C.white,
  },

  /* pix code */
  codeCard: {
    background: C.card,
    borderRadius: 20,
    padding: '18px 20px',
    cursor: 'text',
  },
  codeText: {
    margin: 0,
    fontSize: 11,
    fontFamily: 'monospace',
    color: C.teal,
    wordBreak: 'break-all',
    lineHeight: 1.7,
    userSelect: 'all',
  },
  codeTap: {
    margin: '10px 0 0',
    fontSize: 11,
    color: C.dimMore,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  /* QR toggle */
  qrBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: C.card,
    border: 'none',
    borderRadius: 20,
    padding: '18px 20px',
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
  },
  qrBtnText: {
    fontSize: 15,
    fontWeight: 700,
    color: C.white,
  },
  chevron: {
    fontSize: 22,
    color: C.dim,
    fontWeight: 300,
    transition: 'transform 0.25s',
    display: 'block',
    lineHeight: 1,
  },
  qrWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
    paddingTop: 24,
  },
  qrBox: {
    background: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  qrTip: {
    margin: 0,
    fontSize: 13,
    color: C.dim,
    textAlign: 'center',
  },

  /* trust */
  trust: {
    textAlign: 'center',
    fontSize: 12,
    color: C.dimMore,
    margin: '28px 24px 0',
    lineHeight: 1.5,
  },

  /* sticky bar */
  stickyBar: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
    padding: '16px 20px 32px',
    background: `linear-gradient(to top, ${C.bg} 65%, transparent)`,
  },
  ctaBtn: {
    width: '100%',
    border: 'none',
    borderRadius: 18,
    padding: '20px 24px',
    color: C.bg,
    fontFamily: "'Nunito', sans-serif",
    fontSize: 17,
    fontWeight: 900,
    cursor: 'pointer',
    letterSpacing: '-0.2px',
    transition: 'background 0.25s',
    boxShadow: '0 8px 30px rgba(0,196,167,0.3)',
  },
}
