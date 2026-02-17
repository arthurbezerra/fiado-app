import { useState } from 'react'
import { getSettings, saveSettings } from '../lib/store'
import toast from 'react-hot-toast'

const C = {
  card: '#2A2870', teal: '#00C4A7',
  white: '#FFFFFF', dim: 'rgba(255,255,255,0.5)',
  font: "'Nunito', sans-serif",
}

const inp = {
  display: 'block', width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 14, padding: '15px 16px',
  color: '#fff', fontFamily: "'Nunito', sans-serif", fontSize: 16, fontWeight: 600,
  outline: 'none',
}

const fields = [
  { key: 'nomeLoja', label: 'Nome da loja', placeholder: 'Ex: Mercadinho da Dona Maria', hint: 'Aparece no link de pagamento e na mensagem do WhatsApp.', max: 25 },
  { key: 'cidade',  label: 'Cidade',       placeholder: 'Ex: São Paulo',               hint: 'Usada no QR Code Pix (exigência do Banco Central).', max: 15 },
  { key: 'chavePix',label: 'Chave Pix',    placeholder: 'Ex: meunegocio@email.com',     hint: 'CPF, e-mail, telefone ou chave aleatória.' },
]

export default function Settings() {
  const [form, setForm] = useState(() => {
    const s = getSettings()
    return { chavePix: s.chavePix, nomeLoja: s.nomeLoja, cidade: s.cidade }
  })

  function handleSave(e) {
    e.preventDefault()
    saveSettings({ chavePix: form.chavePix.trim(), nomeLoja: form.nomeLoja.trim(), cidade: form.cidade.trim() })
    toast.success('Configurações salvas!')
  }

  return (
    <div style={{ fontFamily: C.font, color: C.white, minHeight: '100vh', paddingBottom: 40 }}>

      {/* ── Header ── */}
      <div style={{ padding: '52px 20px 28px' }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: '-0.5px' }}>Configurações</h1>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSave} style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {fields.map(({ key, label, placeholder, hint, max }) => (
          <div key={key} style={{ background: C.card, borderRadius: 20, padding: '20px' }}>
            <label style={{ display: 'block', fontSize: 15, fontWeight: 800, color: C.white, marginBottom: 6 }}>
              {label}
            </label>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: C.dim, lineHeight: 1.5 }}>{hint}</p>
            <input
              type="text"
              placeholder={placeholder}
              maxLength={max}
              value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              style={inp}
            />
          </div>
        ))}

        <button
          type="submit"
          style={{
            background: C.teal, border: 'none', borderRadius: 16,
            padding: '18px', color: '#151347', fontFamily: C.font,
            fontSize: 17, fontWeight: 900, cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(0,196,167,0.3)',
          }}
        >
          Salvar
        </button>
      </form>
    </div>
  )
}
