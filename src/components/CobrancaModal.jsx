import { buildWhatsAppMessage, buildWhatsAppUrl, formatCurrency } from '../lib/utils'

export default function CobrancaModal({ customer, totalAberto, onClose }) {
  const message = buildWhatsAppMessage(customer.nome, totalAberto)
  const url = buildWhatsAppUrl(customer.telefone, message)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text">Cobrar via WhatsApp</h3>
            <button
              onClick={onClose}
              className="text-text-light hover:text-text text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          <p className="text-sm text-text-light mb-2">
            Mensagem para <strong>{customer.nome}</strong> — Total: <strong>{formatCurrency(totalAberto)}</strong>
          </p>

          <div className="bg-bg rounded-xl p-4 mb-5 text-sm text-text whitespace-pre-wrap leading-relaxed">
            {message}
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-[#25D366] hover:bg-[#1da851] text-white font-bold py-3 px-4 rounded-xl transition-colors"
          >
            Abrir no WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
