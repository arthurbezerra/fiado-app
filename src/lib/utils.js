export function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

export function getInitials(name) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const avatarColors = [
  '#e74c3c', '#3498db', '#2ecc71', '#9b59b6',
  '#e67e22', '#1abc9c', '#f39c12', '#34495e',
]

export function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export function buildWhatsAppMessage(nome, totalAberto, openDebts = [], chavePix = '') {
  const firstName = nome.split(' ')[0]
  const valor = formatCurrency(totalAberto)

  let msg = `Oi ${firstName}, tudo bem? 😊\n\n`
  msg += `Passando aqui pra lembrar que você tem um saldo em aberto aqui na nossa lojinha.\n`

  if (openDebts.length > 0) {
    msg += `\n`
    for (const d of openDebts) {
      msg += `• ${d.descricao}: ${formatCurrency(d.valor)}\n`
    }
    msg += `\nTotal: *${valor}*`
  } else {
    msg += `\nTotal: *${valor}*`
  }

  if (chavePix) {
    msg += `\n\nPode pagar via Pix 🔑\nChave: *${chavePix}*`
  }

  msg += `\n\nQualquer dúvida é só me chamar. Obrigado(a) pela preferência! 🙏`

  return msg
}

export function buildWhatsAppUrl(telefone, message) {
  return `https://wa.me/55${telefone}?text=${encodeURIComponent(message)}`
}
