import { useState } from 'react'
import { getSettings, saveSettings } from '../lib/store'
import toast from 'react-hot-toast'

export default function Settings() {
  const [chavePix, setChavePix] = useState(() => getSettings().chavePix)

  function handleSave(e) {
    e.preventDefault()
    saveSettings({ chavePix: chavePix.trim() })
    toast.success('Configurações salvas!')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Configurações</h1>

      <form onSubmit={handleSave} className="bg-card rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-bold text-text mb-1">Chave Pix</label>
          <p className="text-xs text-text-light mb-2">
            CPF, e-mail, telefone ou chave aleatória. Será incluída automaticamente nas mensagens de cobrança.
          </p>
          <input
            type="text"
            placeholder="Ex: meunegocio@email.com"
            value={chavePix}
            onChange={(e) => setChavePix(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-2 rounded-lg transition-colors"
        >
          Salvar
        </button>
      </form>
    </div>
  )
}
