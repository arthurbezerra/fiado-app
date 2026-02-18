import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api'

const EmpresaContext = createContext(null)

const EMPRESA_ID_KEY = 'fiado_empresa_id'
const CIDADE_KEY     = 'fiado_cidade'

export function EmpresaProvider({ children }) {
  const [empresaId, _setEmpresaId] = useState(() => localStorage.getItem(EMPRESA_ID_KEY))
  const [empresa,   setEmpresa]    = useState(null)
  const [cidade,    _setCidade]    = useState(() => localStorage.getItem(CIDADE_KEY) ?? '')
  // loading = true only when we have a stored id to fetch
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(EMPRESA_ID_KEY)))

  function setEmpresaId(id) {
    if (id) localStorage.setItem(EMPRESA_ID_KEY, id)
    else    localStorage.removeItem(EMPRESA_ID_KEY)
    _setEmpresaId(id)
  }

  function setCidade(v) {
    localStorage.setItem(CIDADE_KEY, v)
    _setCidade(v)
  }

  // Fetch empresa data on mount (or when empresaId changes)
  useEffect(() => {
    if (!empresaId) { setLoading(false); return }
    api.getEmpresa(empresaId)
      .then(data => { setEmpresa(data); setLoading(false) })
      .catch(() => {
        // Could not load — clear stale id so app doesn't get stuck
        setEmpresaId(null)
        setLoading(false)
      })
  }, [empresaId])

  // Called by Settings page on save.
  // Creates the Empresa on first save, updates on subsequent saves.
  async function saveEmpresaSettings({ nome, pixKey, cidade: newCidade }) {
    if (newCidade !== undefined) setCidade(newCidade)

    if (empresaId) {
      const data = await api.updateEmpresa(empresaId, { nome, pixKey })
      setEmpresa(data)
    } else {
      const data = await api.createEmpresa({ nome, pixKey })
      setEmpresaId(data.id)
      setEmpresa(data)
    }
  }

  // `settings` keeps the same shape the existing CobrancaModal + buildPaymentLink expect
  const settings = {
    nomeLoja: empresa?.nome   ?? '',
    chavePix: empresa?.pixKey ?? '',
    cidade,
  }

  return (
    <EmpresaContext.Provider value={{ empresaId, empresa, settings, loading, saveEmpresaSettings }}>
      {children}
    </EmpresaContext.Provider>
  )
}

export const useEmpresa = () => useContext(EmpresaContext)
