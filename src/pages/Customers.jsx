import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useEmpresa } from '../lib/EmpresaContext'
import { api } from '../lib/api'
import { formatCurrency } from '../lib/utils'
import Avatar from '../components/Avatar'
import BottomSheet from '../components/BottomSheet'
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

export default function Customers() {
  const { empresaId } = useEmpresa()
  const [customers, setCustomers] = useState([])
  const [showForm, setShowForm]     = useState(false)
  const [search, setSearch]         = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [nome, setNome]             = useState('')
  const [telefone, setTelefone]     = useState('')
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    if (!empresaId) return
    api.listClientes(empresaId).then(setCustomers).catch(console.error)
  }, [empresaId])

  // Filter locally for instant feedback
  const filtered = search.trim()
    ? customers.filter(c =>
        c.nome.toLowerCase().includes(search.toLowerCase()) ||
        (c.telefone ?? '').includes(search.replace(/\D/g, ''))
      )
    : customers

  async function handleAdd(e) {
    e.preventDefault()
    if (!nome.trim() || !telefone.trim() || !empresaId) return
    setSaving(true)
    try {
      const novo = await api.createCliente(empresaId, {
        nome:     nome.trim(),
        telefone: telefone.replace(/\D/g, ''),
      })
      setCustomers(prev => [...prev, { ...novo, totalAberto: 0 }])
      setNome(''); setTelefone('')
      setShowForm(false)
      toast.success('Cliente adicionado!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ fontFamily: C.font, color: C.white, minHeight: '100vh', paddingBottom: 32 }}>

      {/* ── Header ── */}
      <div style={{ padding: '52px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: '-0.5px' }}>Clientes</h1>
        <button
          onClick={() => setShowSearch(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: showSearch ? C.teal : C.dim }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </button>
      </div>

      {/* ── Search ── */}
      {showSearch && (
        <div style={{ padding: '0 20px 16px' }}>
          <input
            type="search"
            placeholder="Buscar cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            style={{ ...inp, marginBottom: 0 }}
          />
        </div>
      )}

      {/* ── List ── */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <p style={{ color: C.dim, fontSize: 14, textAlign: 'center', padding: '32px 0' }}>
            Nenhum cliente encontrado.
          </p>
        ) : (
          filtered.map(c => (
            <Link
              key={c.id}
              to={`/clientes/${c.id}`}
              style={{ background: C.card, borderRadius: 20, padding: '16px', display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}
            >
              <Avatar nome={c.nome} size="md" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.white, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.nome}
                </p>
                <p style={{ margin: '3px 0 0', fontSize: 13, color: C.dim }}>
                  {c.telefone ?? ''}
                </p>
              </div>
              {c.totalAberto > 0 ? (
                <span style={{ fontSize: 15, fontWeight: 900, color: C.red, flexShrink: 0 }}>
                  {formatCurrency(c.totalAberto)}
                </span>
              ) : (
                <span style={{
                  fontSize: 11, fontWeight: 800, color: C.green,
                  background: 'rgba(52,211,154,0.15)', borderRadius: 20,
                  padding: '5px 10px', flexShrink: 0,
                }}>
                  Em dia
                </span>
              )}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))
        )}
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => setShowForm(true)}
        style={{
          position: 'fixed', bottom: 88, right: 20,
          width: 56, height: 56, borderRadius: '50%',
          background: C.teal, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 24px rgba(0,196,167,0.4)',
          zIndex: 30,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#151347" strokeWidth="3" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {/* ── Add Customer Sheet ── */}
      {showForm && (
        <BottomSheet title="Novo Cliente" onClose={() => setShowForm(false)}>
          <form onSubmit={handleAdd}>
            <input
              type="text" placeholder="Nome do cliente" value={nome}
              onChange={e => setNome(e.target.value)} autoFocus style={inp}
            />
            <input
              type="tel" placeholder="WhatsApp com DDD" value={telefone}
              onChange={e => setTelefone(e.target.value)} style={inp}
            />
            <button type="submit" disabled={saving} style={{
              width: '100%',
              background: saving ? 'rgba(0,196,167,0.5)' : C.teal,
              border: 'none', borderRadius: 16,
              padding: '18px', color: '#151347', fontFamily: C.font,
              fontSize: 17, fontWeight: 900,
              cursor: saving ? 'default' : 'pointer',
              boxShadow: '0 6px 24px rgba(0,196,167,0.3)', marginTop: 4,
            }}>
              {saving ? 'Adicionando...' : 'Adicionar Cliente'}
            </button>
          </form>
        </BottomSheet>
      )}
    </div>
  )
}
