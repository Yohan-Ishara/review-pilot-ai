import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  CreditCard,
  Home,
  LogOut,
  MapPin,
  MessageSquareText,
  Settings,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../hooks/useAuth'
import Button from './Button'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/reviews', label: 'Reviews', icon: MessageSquareText },
  { to: '/locations', label: 'Locations', icon: MapPin },
  { to: '/billing', label: 'Billing', icon: CreditCard },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <aside className="bg-slate-950 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72">
        <div className="flex min-h-full flex-col p-5">
          <Link to="/dashboard" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-sky-400 text-slate-950">
              <Home className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-bold">ReviewPilot AI</p>
              <p className="text-xs text-slate-400">Reputation command center</p>
            </div>
          </Link>

          <nav className="mt-8 grid gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'border-sky-400/40 bg-sky-400/15 text-sky-100 shadow-sm'
                      : 'border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-8">
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
            <Button
              variant="ghost"
              className="mt-3 w-full justify-start text-slate-200 hover:bg-slate-900 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
      <main className="min-h-screen flex-1 lg:pl-72">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
