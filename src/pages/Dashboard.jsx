import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useEmpresa } from '../lib/EmpresaContext'
import { api } from '../lib/api'
import { formatCurrency } from '../lib/utils'
import Avatar from '../components/Avatar'
import CobrancaModal from '../components/CobrancaModal'

const C = {
  bg: '#1E1C54', card: '#2A2870', teal: '#00C4A7',
  white: '#FFFFFF', dim: 'rgba(255,255,255,0.5)',
  faint: 'rgba(255,255,255,0.12)', red: '#FF6B6B', green: '#34D39A',
  font: "'Nunito', sans-serif",
}

export default function Dashboard() {
  const { empresaId } = useEmpresa()
  const [clientes, setClientes]           = useState([])
  const [totalRecebido, setTotalRecebido] = useState(0)
  const [loading, setLoading]             = useState(true)
  const [cobranca, setCobranca]           = useState(null)   // { cliente, openDebts }
  const [loadingCobrarId, setLoadingCobrarId] = useState(null)

  useEffect(() => {
    if (!empresaId) { setLoading(false); return }

    Promise.all([
      api.listClientes(empresaId),
      api.listDividas(empresaId, 'PAGO,REPASSADO'),
    ])
      .then(([lista, pagas]) => {
        setClientes(lista)
        setTotalRecebido(pagas.reduce((s, d) => s + Number(d.valor), 0))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [empresaId])

  // Fetch full customer detail so CobrancaModal can list individual debts
  async function handleCobrar(c) {
    setLoadingCobrarId(c.id)
    try {
      const detail = await api.getCliente(c.id)
      const openDebts = detail.dividas.filter(
        d => d.status === 'PENDENTE' || d.status === 'AGUARDANDO_PAGAMENTO'
      )
      setCobranca({ cliente: detail, openDebts })
    } catch {
      setCobranca({ cliente: c, openDebts: [] })
    } finally {
      setLoadingCobrarId(null)
    }
  }

  const totalAberto       = clientes.reduce((s, c) => s + c.totalAberto, 0)
  const clientesComDivida = clientes.filter(c => c.totalAberto > 0).length
  const topDebtors        = clientes
    .filter(c => c.totalAberto > 0)
    .sort((a, b) => b.totalAberto - a.totalAberto)

  if (loading) {
    return (
      <div style={{ fontFamily: C.font, color: C.dim, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        Carregando...
      </div>
    )
  }

  return (
    <div style={{ fontFamily: C.font, color: C.white, minHeight: '100vh', paddingBottom: 32 }}>

      {/* ── Header ── */}
      <div style={{ padding: '52px 20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            seu painel
          </p>
          <h1 style={{ margin: '4px 0 0', fontSize: 30, fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1 }}>
            <span style={{ color: C.teal }}>Fiado</span>App
          </h1>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, padding: '0 20px 28px' }}>
        {[
          { label: 'Em aberto', value: formatCurrency(totalAberto),   color: C.red   },
          { label: 'Recebido',  value: formatCurrency(totalRecebido), color: C.green },
          { label: 'Devedores', value: clientesComDivida,             color: C.white },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: C.card, borderRadius: 18, padding: '14px 12px' }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {label}
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 16, fontWeight: 900, color, letterSpacing: '-0.3px', lineHeight: 1 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Debtors list ── */}
      <div style={{ padding: '0 20px' }}>
        <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 800, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Maiores Devedores
        </p>

        {topDebtors.length === 0 ? (
          <div style={{ background: C.card, borderRadius: 20, padding: '32px 20px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 32 }}>🎉</p>
            <p style={{ margin: '10px 0 0', fontSize: 15, fontWeight: 700, color: C.dim }}>
              Nenhum devedor em aberto
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topDebtors.map(c => (
              <div key={c.id} style={{
                background: C.card, borderRadius: 20, padding: '16px',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <Link to={`/clientes/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0, textDecoration: 'none' }}>
                  <Avatar nome={c.nome} size="md" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.white, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.nome}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 14, fontWeight: 700, color: C.red }}>
                      {formatCurrency(c.totalAberto)}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => handleCobrar(c)}
                  disabled={loadingCobrarId === c.id}
                  style={{
                    background: loadingCobrarId === c.id ? 'rgba(0,196,167,0.5)' : C.teal,
                    border: 'none', borderRadius: 12,
                    padding: '9px 16px', color: '#151347',
                    fontFamily: C.font, fontSize: 13, fontWeight: 900,
                    cursor: loadingCobrarId === c.id ? 'default' : 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {loadingCobrarId === c.id ? '...' : 'Cobrar'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {cobranca && (
        <CobrancaModal
          customer={cobranca.cliente}
          totalAberto={cobranca.cliente.totalAberto}
          openDebts={cobranca.openDebts}
          onClose={() => setCobranca(null)}
        />
      )}
    </div>
  )
}
