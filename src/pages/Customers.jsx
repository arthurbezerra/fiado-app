import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getCustomers, addCustomer } from '../lib/store'
import { formatCurrency } from '../lib/utils'
import Avatar from '../components/Avatar'
import toast from 'react-hot-toast'

export default function Customers() {
  const [customers, setCustomers] = useState(() => getCustomers())
  const [showForm, setShowForm] = useState(false)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [search, setSearch] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    if (!nome.trim() || !telefone.trim()) return
    addCustomer(nome.trim(), telefone.trim())
    setCustomers(getCustomers())
    setNome('')
    setTelefone('')
    setShowForm(false)
    toast.success('Cliente adicionado!')
  }

  const filtered = search.trim()
    ? customers.filter((c) =>
        c.nome.toLowerCase().includes(search.toLowerCase()) ||
        c.telefone.includes(search.replace(/\D/g, ''))
      )
    : customers

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Clientes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent hover:bg-accent-hover text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Novo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-card rounded-xl p-4 shadow-sm space-y-3">
          <input
            type="text"
            placeholder="Nome do cliente"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            autoFocus
          />
          <input
            type="tel"
            placeholder="WhatsApp (com DDD)"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-2 rounded-lg transition-colors"
          >
            Adicionar Cliente
          </button>
        </form>
      )}

      <input
        type="search"
        placeholder="Buscar cliente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-card shadow-sm"
      />

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-text-light text-sm">Nenhum cliente encontrado.</p>
        ) : (
          filtered.map((c) => {
            const totalAberto = c.dividas
              .filter((d) => !d.pago)
              .reduce((sum, d) => sum + d.valor, 0)

            return (
              <Link
                key={c.id}
                to={`/clientes/${c.id}`}
                className="bg-card rounded-xl p-4 shadow-sm flex items-center gap-3 block"
              >
                <Avatar nome={c.nome} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text truncate">{c.nome}</p>
                  <p className="text-xs text-text-light">{c.telefone}</p>
                </div>
                {totalAberto > 0 ? (
                  <span className="text-sm font-bold text-danger">
                    {formatCurrency(totalAberto)}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-full">
                    Em dia
                  </span>
                )}
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
