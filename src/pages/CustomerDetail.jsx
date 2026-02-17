import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCustomer, addDebt, markDebtPaid, deleteDebt, deleteCustomer } from '../lib/store'
import { formatCurrency, formatDate } from '../lib/utils'
import Avatar from '../components/Avatar'
import BottomSheet from '../components/BottomSheet'
import CobrancaModal from '../components/CobrancaModal'
import toast from 'react-hot-toast'

const C = {
  bg: '#1E1C54', card: '#2A2870', teal: '#00C4A7',
  white: '#FFFFFF', dim: 'rgba(255,255,255,0.5)',
  faint: 'rgba(255,255,255,0.08)', red: '#FF6B6B', green: '#34D39A',
  font: "'Nunito', sans-serif",
}

const inp = {
  display: 'block', width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 14, padding: '15px 16px',
  color: '#fff', fontFamily: "'Nunito', sans-serif", fontSize: 16, fontWeight: 600,
  outline: 'none', marginBottom: 12,
}

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(() => getCustomer(id))
  const [showForm, setShowForm]       = useState(false)
  const [showCobranca, setShowCobranca] = useState(false)
  const [descricao, setDescricao]     = useState('')
  const [valor, setValor]             = useState('')
  const [data, setData]               = useState(() => new Date().toISOString().slice(0, 10))

  if (!customer) {
    return (
      <div style={{ fontFamily: C.font, color: C.white, textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ color: C.dim, marginBottom: 16 }}>Cliente não encontrado.</p>
        <button onClick={() => navigate('/clientes')} style={{ color: C.teal, background: 'none', border: 'none', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: C.font }}>
          Voltar
        </button>
      </div>
    )
  }

  const openDebts  = customer.dividas.filter(d => !d.pago)
  const totalAberto = openDebts.reduce((s, d) => s + d.valor, 0)
  const totalPago   = customer.dividas.filter(d => d.pago).reduce((s, d) => s + d.valor, 0)

  function handleAddDebt(e) {
    e.preventDefault()
    if (!descricao.trim() || !valor || Number(valor) <= 0) return
    addDebt(id, descricao.trim(), Number(valor), data)
    setCustomer(getCustomer(id))
    setDescricao(''); setValor('')
    setShowForm(false)
    toast.success('Dívida registrada!')
  }

  function handleMarkPaid(debtId) {
    markDebtPaid(id, debtId)
    setCustomer(getCustomer(id))
    toast.success('Marcado como pago!')
  }

  function handleDeleteDebt(debtId) {
    if (!window.confirm('Excluir este lançamento?')) return
    deleteDebt(id, debtId)
    setCustomer(getCustomer(id))
    toast.success('Lançamento excluído.')
  }

  function handleDeleteCustomer() {
    if (!window.confirm(`Excluir "${customer.nome}" e todo o histórico?`)) return
    deleteCustomer(id)
    toast.success('Cliente excluído.')
    navigate('/clientes')
  }

  const sortedDebts = [...customer.dividas].sort((a, b) => new Date(b.data) - new Date(a.data))

  return (
    <div style={{ fontFamily: C.font, color: C.white, minHeight: '100vh', paddingBottom: 40 }}>

      {/* ── Header ── */}
      <div style={{ padding: '52px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate('/clientes')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.dim, padding: 4, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={handleDeleteCustomer}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,107,107,0.5)', fontSize: 12, fontWeight: 700, fontFamily: C.font, padding: 4 }}
        >
          Excluir
        </button>
      </div>

      {/* ── Customer Hero ── */}
      <div style={{ padding: '24px 20px 28px', textAlign: 'center' }}>
        <Avatar nome={customer.nome} size="xl" />
        <h1 style={{ margin: '16px 0 4px', fontSize: 26, fontWeight: 900, letterSpacing: '-0.4px' }}>
          {customer.nome}
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: C.dim }}>{customer.telefone}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Em Aberto</p>
            <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 900, color: C.red, letterSpacing: '-0.5px' }}>
              {formatCurrency(totalAberto)}
            </p>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pago</p>
            <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 900, color: C.green, letterSpacing: '-0.5px' }}>
              {formatCurrency(totalPago)}
            </p>
          </div>
        </div>

        {totalAberto > 0 && (
          <button
            onClick={() => setShowCobranca(true)}
            style={{
              marginTop: 20, background: '#25D366', border: 'none', borderRadius: 16,
              padding: '14px 28px', color: '#fff', fontFamily: C.font,
              fontSize: 15, fontWeight: 900, cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(37,211,102,0.3)',
            }}
          >
            Cobrar via WhatsApp
          </button>
        )}
      </div>

      {/* ── Debt History ── */}
      <div style={{ padding: '0 20px' }}>
        <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 800, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Histórico
        </p>

        {sortedDebts.length === 0 ? (
          <div style={{ background: C.card, borderRadius: 20, padding: '28px', textAlign: 'center' }}>
            <p style={{ margin: 0, color: C.dim, fontSize: 14 }}>Nenhuma dívida registrada.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sortedDebts.map(d => (
              <div
                key={d.id}
                style={{
                  background: C.card, borderRadius: 20, padding: '16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  opacity: d.pago ? 0.55 : 1,
                }}
              >
                {/* Teal circle icon (like Tikkie's € circle) */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: d.pago ? 'rgba(52,211,154,0.15)' : 'rgba(0,196,167,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: 18,
                }}>
                  {d.pago ? '✓' : '₢'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.white, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.descricao}
                  </p>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: C.dim }}>{formatDate(d.data)}</p>
                </div>

                <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: d.pago ? C.green : C.red, flexShrink: 0, textDecoration: d.pago ? 'line-through' : 'none' }}>
                  {formatCurrency(d.valor)}
                </p>

                {!d.pago ? (
                  <button
                    onClick={() => handleMarkPaid(d.id)}
                    style={{
                      background: C.green, border: 'none', borderRadius: 10,
                      padding: '7px 12px', color: '#151347',
                      fontFamily: C.font, fontSize: 12, fontWeight: 900,
                      cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    Pagar
                  </button>
                ) : (
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: C.green,
                    background: 'rgba(52,211,154,0.15)', borderRadius: 20,
                    padding: '5px 10px', flexShrink: 0,
                  }}>
                    Pago
                  </span>
                )}

                <button
                  onClick={() => handleDeleteDebt(d.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', fontSize: 20, lineHeight: 1, padding: '0 0 0 4px', flexShrink: 0 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FAB: add debt ── */}
      <button
        onClick={() => setShowForm(true)}
        style={{
          position: 'fixed', bottom: 88, right: 20,
          width: 56, height: 56, borderRadius: '50%',
          background: C.teal, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 24px rgba(0,196,167,0.4)', zIndex: 30,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#151347" strokeWidth="3" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {/* ── Add Debt Sheet ── */}
      {showForm && (
        <BottomSheet title="Nova Dívida" onClose={() => setShowForm(false)}>
          <form onSubmit={handleAddDebt}>
            <input
              type="text" placeholder="Descrição  (ex: 2kg arroz)" value={descricao}
              onChange={e => setDescricao(e.target.value)} autoFocus style={inp}
            />
            <input
              type="number" placeholder="Valor (R$)" step="0.01" min="0.01"
              value={valor} onChange={e => setValor(e.target.value)} style={inp}
            />
            <input
              type="date" value={data} onChange={e => setData(e.target.value)} style={inp}
            />
            <button type="submit" style={{
              width: '100%', background: C.teal, border: 'none', borderRadius: 16,
              padding: '18px', color: '#151347', fontFamily: C.font,
              fontSize: 17, fontWeight: 900, cursor: 'pointer',
              boxShadow: '0 6px 24px rgba(0,196,167,0.3)', marginTop: 4,
            }}>
              Registrar Dívida
            </button>
          </form>
        </BottomSheet>
      )}

      {/* ── Cobrança Modal ── */}
      {showCobranca && (
        <CobrancaModal
          customer={customer}
          totalAberto={totalAberto}
          openDebts={openDebts}
          onClose={() => setShowCobranca(false)}
        />
      )}
    </div>
  )
}
