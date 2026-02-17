import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getStats, getTopDebtors } from '../lib/store'
import { formatCurrency } from '../lib/utils'
import Avatar from '../components/Avatar'
import CobrancaModal from '../components/CobrancaModal'

export default function Dashboard() {
  const [stats, setStats] = useState(() => getStats())
  const [topDebtors, setTopDebtors] = useState(() => getTopDebtors())
  const [cobranca, setCobranca] = useState(null)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Painel</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <p className="text-text-light text-xs font-semibold uppercase tracking-wide">Total em Aberto</p>
          <p className="text-2xl font-extrabold text-danger mt-1">{formatCurrency(stats.totalAberto)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <p className="text-text-light text-xs font-semibold uppercase tracking-wide">Total Recebido</p>
          <p className="text-2xl font-extrabold text-success mt-1">{formatCurrency(stats.totalRecebido)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <p className="text-text-light text-xs font-semibold uppercase tracking-wide">Clientes Devendo</p>
          <p className="text-2xl font-extrabold text-text mt-1">{stats.clientesComDivida}</p>
        </div>
      </div>

      {/* Top Debtors */}
      <div>
        <h2 className="text-lg font-bold mb-3">Maiores Devedores</h2>
        {topDebtors.length === 0 ? (
          <p className="text-text-light text-sm">Nenhum cliente com dívida em aberto.</p>
        ) : (
          <div className="space-y-2">
            {topDebtors.map((c) => (
              <div
                key={c.id}
                className="bg-card rounded-xl p-4 shadow-sm flex items-center gap-3"
              >
                <Avatar nome={c.nome} />
                <Link to={`/clientes/${c.id}`} className="flex-1 min-w-0">
                  <p className="font-bold text-text truncate">{c.nome}</p>
                  <p className="text-sm text-danger font-semibold">
                    {formatCurrency(c.totalAberto)}
                  </p>
                </Link>
                <button
                  onClick={() => setCobranca(c)}
                  className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors shrink-0"
                >
                  Cobrar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {cobranca && (
        <CobrancaModal
          customer={cobranca}
          totalAberto={cobranca.totalAberto}
          onClose={() => setCobranca(null)}
        />
      )}
    </div>
  )
}
