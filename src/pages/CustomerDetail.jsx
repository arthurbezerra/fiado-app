import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCustomer, addDebt, markDebtPaid, deleteDebt, deleteCustomer } from '../lib/store'
import { formatCurrency, formatDate } from '../lib/utils'
import Avatar from '../components/Avatar'
import CobrancaModal from '../components/CobrancaModal'
import toast from 'react-hot-toast'

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(() => getCustomer(id))
  const [showForm, setShowForm] = useState(false)
  const [showCobranca, setShowCobranca] = useState(false)
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10))

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-text-light mb-4">Cliente não encontrado.</p>
        <button onClick={() => navigate('/clientes')} className="text-accent font-bold">
          Voltar
        </button>
      </div>
    )
  }

  const openDebts = customer.dividas.filter((d) => !d.pago)
  const totalAberto = openDebts.reduce((sum, d) => sum + d.valor, 0)
  const totalPago = customer.dividas
    .filter((d) => d.pago)
    .reduce((sum, d) => sum + d.valor, 0)

  function handleAddDebt(e) {
    e.preventDefault()
    if (!descricao.trim() || !valor || Number(valor) <= 0) return
    addDebt(id, descricao.trim(), Number(valor), data)
    setCustomer(getCustomer(id))
    setDescricao('')
    setValor('')
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
    if (!window.confirm(`Excluir o cliente "${customer.nome}" e todo o histórico? Esta ação não pode ser desfeita.`)) return
    deleteCustomer(id)
    toast.success('Cliente excluído.')
    navigate('/clientes')
  }

  const sortedDebts = [...customer.dividas].sort(
    (a, b) => new Date(b.data) - new Date(a.data)
  )

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/clientes')}
        className="text-text-light hover:text-text text-sm font-semibold"
      >
        &larr; Voltar
      </button>

      {/* Customer Header */}
      <div className="bg-card rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <Avatar nome={customer.nome} size="xl" />
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-xl font-extrabold">{customer.nome}</h1>
          <p className="text-text-light text-sm">{customer.telefone}</p>
          <div className="flex gap-4 mt-2 justify-center sm:justify-start">
            <div>
              <p className="text-xs text-text-light">Em Aberto</p>
              <p className="font-bold text-danger">{formatCurrency(totalAberto)}</p>
            </div>
            <div>
              <p className="text-xs text-text-light">Pago</p>
              <p className="font-bold text-success">{formatCurrency(totalPago)}</p>
            </div>
          </div>
        </div>
        {totalAberto > 0 && (
          <button
            onClick={() => setShowCobranca(true)}
            className="bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors shrink-0"
          >
            Cobrar via WhatsApp
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent hover:bg-accent-hover text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Nova Dívida'}
        </button>
      </div>

      {/* Add Debt Form */}
      {showForm && (
        <form onSubmit={handleAddDebt} className="bg-card rounded-xl p-4 shadow-sm space-y-3">
          <input
            type="text"
            placeholder="Descrição (ex: 2kg arroz)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            autoFocus
          />
          <input
            type="number"
            placeholder="Valor (R$)"
            step="0.01"
            min="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-2 rounded-lg transition-colors"
          >
            Registrar Dívida
          </button>
        </form>
      )}

      {/* Debt History */}
      <div>
        <h2 className="text-lg font-bold mb-3">Histórico</h2>
        {sortedDebts.length === 0 ? (
          <p className="text-text-light text-sm">Nenhuma dívida registrada.</p>
        ) : (
          <div className="space-y-2">
            {sortedDebts.map((d) => (
              <div
                key={d.id}
                className={`bg-card rounded-xl p-4 shadow-sm flex items-center gap-3 ${
                  d.pago ? 'opacity-60' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text truncate">{d.descricao}</p>
                  <p className="text-xs text-text-light">{formatDate(d.data)}</p>
                </div>
                <p
                  className={`font-bold text-sm shrink-0 ${
                    d.pago ? 'text-success line-through' : 'text-danger'
                  }`}
                >
                  {formatCurrency(d.valor)}
                </p>
                {d.pago ? (
                  <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-full shrink-0">
                    Pago
                  </span>
                ) : (
                  <button
                    onClick={() => handleMarkPaid(d.id)}
                    className="text-xs font-bold text-white bg-success hover:bg-success/80 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                  >
                    Pagar
                  </button>
                )}
                <button
                  onClick={() => handleDeleteDebt(d.id)}
                  className="text-text-light hover:text-danger transition-colors shrink-0 text-lg leading-none ml-1"
                  title="Excluir lançamento"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="border border-danger/20 rounded-xl p-4">
        <h3 className="text-sm font-bold text-danger mb-2">Zona de perigo</h3>
        <button
          onClick={handleDeleteCustomer}
          className="text-sm font-bold text-danger hover:bg-danger/10 px-3 py-2 rounded-lg transition-colors"
        >
          Excluir cliente
        </button>
      </div>

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
