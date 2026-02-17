import { useState } from 'react'
import { getSettings, saveSettings } from '../lib/store'
import toast from 'react-hot-toast'

export default function Settings() {
  const [form, setForm] = useState(() => {
    const s = getSettings()
    return { chavePix: s.chavePix, nomeLoja: s.nomeLoja, cidade: s.cidade }
  })

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSave(e) {
    e.preventDefault()
    saveSettings({ chavePix: form.chavePix.trim(), nomeLoja: form.nomeLoja.trim(), cidade: form.cidade.trim() })
    toast.success('Configurações salvas!')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Configurações</h1>

      <form onSubmit={handleSave} className="bg-card rounded-xl p-5 shadow-sm space-y-5">

        <div>
          <label className="block text-sm font-bold text-text mb-1">Nome da loja</label>
          <p className="text-xs text-text-light mb-2">
            Aparece no link de pagamento e na mensagem do WhatsApp.
          </p>
          <input
            type="text"
            placeholder="Ex: Mercadinho da Dona Maria"
            maxLength={25}
            value={form.nomeLoja}
            onChange={(e) => set('nomeLoja', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-text mb-1">Cidade</label>
          <p className="text-xs text-text-light mb-2">
            Usada no QR Code Pix (exigência do Banco Central).
          </p>
          <input
            type="text"
            placeholder="Ex: São Paulo"
            maxLength={15}
            value={form.cidade}
            onChange={(e) => set('cidade', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-text mb-1">Chave Pix</label>
          <p className="text-xs text-text-light mb-2">
            CPF, e-mail, telefone ou chave aleatória. Incluída no link e QR Code de pagamento.
          </p>
          <input
            type="text"
            placeholder="Ex: meunegocio@email.com"
            value={form.chavePix}
            onChange={(e) => set('chavePix', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-2.5 rounded-lg transition-colors"
        >
          Salvar
        </button>
      </form>
    </div>
  )
}
