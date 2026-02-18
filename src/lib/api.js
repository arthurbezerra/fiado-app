const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

async function req(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
  return data
}

export const api = {
  // Empresa
  createEmpresa: (body) => req('POST', '/empresas', body),
  getEmpresa: (id) => req('GET', `/empresas/${id}`),
  updateEmpresa: (id, body) => req('PATCH', `/empresas/${id}`, body),

  // Clientes
  listClientes: (empresaId, search) =>
    req('GET', `/empresas/${empresaId}/clientes${search ? `?q=${encodeURIComponent(search)}` : ''}`),
  createCliente: (empresaId, body) => req('POST', `/empresas/${empresaId}/clientes`, body),
  getCliente: (id) => req('GET', `/clientes/${id}`),
  deleteCliente: (id) => req('DELETE', `/clientes/${id}`),

  // Dívidas
  listDividas: (empresaId, status) =>
    req('GET', `/empresas/${empresaId}/dividas${status ? `?status=${status}` : ''}`),
  createDivida: (clienteId, body) => req('POST', `/clientes/${clienteId}/dividas`, body),
  updateDivida: (id, body) => req('PATCH', `/dividas/${id}`, body),
  deleteDivida: (id) => req('DELETE', `/dividas/${id}`),

  // Pix
  createCharge: (body) => req('POST', '/pix/cobranca', body),
}
