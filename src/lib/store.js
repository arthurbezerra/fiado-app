import { seedData } from './seed'

const STORAGE_KEY = 'fiado_app_data'

function load() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    return JSON.parse(raw)
  }
  save(seedData)
  return seedData
}

function save(customers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
}

export function getCustomers() {
  return load()
}

export function getCustomer(id) {
  return load().find((c) => c.id === id) || null
}

export function addCustomer(nome, telefone) {
  const customers = load()
  const customer = {
    id: 'c' + Date.now(),
    nome,
    telefone: telefone.replace(/\D/g, ''),
    dividas: [],
  }
  customers.push(customer)
  save(customers)
  return customer
}

export function addDebt(customerId, descricao, valor, data) {
  const customers = load()
  const customer = customers.find((c) => c.id === customerId)
  if (!customer) return null
  const debt = {
    id: 'd' + Date.now(),
    descricao,
    valor: Number(valor),
    data,
    pago: false,
  }
  customer.dividas.push(debt)
  save(customers)
  return debt
}

export function markDebtPaid(customerId, debtId) {
  const customers = load()
  const customer = customers.find((c) => c.id === customerId)
  if (!customer) return false
  const debt = customer.dividas.find((d) => d.id === debtId)
  if (!debt) return false
  debt.pago = true
  save(customers)
  return true
}

export function getStats() {
  const customers = load()
  let totalAberto = 0
  let totalRecebido = 0
  let clientesComDivida = 0

  for (const c of customers) {
    let temDivida = false
    for (const d of c.dividas) {
      if (d.pago) {
        totalRecebido += d.valor
      } else {
        totalAberto += d.valor
        temDivida = true
      }
    }
    if (temDivida) clientesComDivida++
  }

  return { totalAberto, totalRecebido, clientesComDivida }
}

export function getTopDebtors() {
  const customers = load()
  return customers
    .map((c) => {
      const totalAberto = c.dividas
        .filter((d) => !d.pago)
        .reduce((sum, d) => sum + d.valor, 0)
      return { ...c, totalAberto }
    })
    .filter((c) => c.totalAberto > 0)
    .sort((a, b) => b.totalAberto - a.totalAberto)
}

export function deleteDebt(customerId, debtId) {
  const customers = load()
  const customer = customers.find((c) => c.id === customerId)
  if (!customer) return false
  customer.dividas = customer.dividas.filter((d) => d.id !== debtId)
  save(customers)
  return true
}

export function deleteCustomer(customerId) {
  const customers = load()
  const filtered = customers.filter((c) => c.id !== customerId)
  if (filtered.length === customers.length) return false
  save(filtered)
  return true
}

const SETTINGS_KEY = 'fiado_app_settings'

export function getSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY)
  return raw ? JSON.parse(raw) : { chavePix: '', nomeLoja: '', cidade: '' }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
