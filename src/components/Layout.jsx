import { NavLink, Outlet } from 'react-router-dom'

function IconGrid({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <rect x="3" y="3" width="8" height="8" rx="2" fill={color} />
      <rect x="13" y="3" width="8" height="8" rx="2" fill={color} />
      <rect x="3" y="13" width="8" height="8" rx="2" fill={color} />
      <rect x="13" y="13" width="8" height="8" rx="2" fill={color} />
    </svg>
  )
}

function IconPeople({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={color}>
      <circle cx="9" cy="7" r="4" />
      <path d="M1 21v-1a8 8 0 0 1 8-8h4a8 8 0 0 1 8 8v1z" />
    </svg>
  )
}

function IconGear({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

const TABS = [
  { to: '/',             label: 'Painel',   Icon: IconGrid,   end: true },
  { to: '/clientes',     label: 'Clientes', Icon: IconPeople, end: false },
  { to: '/configuracoes',label: 'Config',   Icon: IconGear,   end: false },
]

export default function Layout() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#1E1C54',
      maxWidth: 430,
      margin: '0 auto',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 'env(safe-area-inset-top)',
    }}>
      <main style={{ flex: 1, paddingBottom: 72 }}>
        <Outlet />
      </main>

      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        background: '#151347',
        display: 'flex',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        zIndex: 40,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {TABS.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} style={{ flex: 1, textDecoration: 'none' }}>
            {({ isActive }) => {
              const color = isActive ? '#00C4A7' : 'rgba(255,255,255,0.35)'
              return (
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '10px 0 18px', gap: 5, color,
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 10, fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}>
                  <Icon color={color} />
                  {label}
                </div>
              )
            }}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
