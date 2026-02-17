import { NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-navy text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <NavLink to="/" className="text-xl font-extrabold tracking-tight">
          <span className="text-accent">Fiado</span>App
        </NavLink>
        <nav className="flex gap-4 text-sm font-semibold">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'text-accent' : 'text-white/70 hover:text-white'
            }
          >
            Painel
          </NavLink>
          <NavLink
            to="/clientes"
            className={({ isActive }) =>
              isActive ? 'text-accent' : 'text-white/70 hover:text-white'
            }
          >
            Clientes
          </NavLink>
          <NavLink
            to="/configuracoes"
            className={({ isActive }) =>
              isActive ? 'text-accent' : 'text-white/70 hover:text-white'
            }
          >
            Config
          </NavLink>
        </nav>
      </header>

      <main className="flex-1 p-4 max-w-3xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
