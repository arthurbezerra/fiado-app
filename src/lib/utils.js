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

export function buildWhatsAppMessage(nome, totalAberto) {
  const firstName = nome.split(' ')[0]
  const valor = formatCurrency(totalAberto)
  return (
    `Oi ${firstName}, tudo bem? 😊\n\n` +
    `Passando aqui pra lembrar que você tem um saldo em aberto de ${valor} aqui na nossa lojinha.\n\n` +
    `Quando puder, pode acertar via Pix! Qualquer dúvida é só me chamar.\n\n` +
    `Obrigado(a) pela preferência! 🙏`
  )
}

export function buildWhatsAppUrl(telefone, message) {
  return `https://wa.me/55${telefone}?text=${encodeURIComponent(message)}`
}
