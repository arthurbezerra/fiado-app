import { getInitials, getAvatarColor } from '../lib/utils'

export default function Avatar({ nome, size = 'md' }) {
  const initials = getInitials(nome)
  const color = getAvatarColor(nome)

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}
