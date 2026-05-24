import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bot,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquareText,
  Settings,
  Sparkles,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../hooks/useAuth'
import Button from './Button'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/reviews', label: 'Reviews', icon: MessageSquareText },
  { to: '/ai-replies', label: 'AI Replies', icon: Bot },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/locations', label: 'Locations', icon: MapPin },
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
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="border-b border-indigo-100 bg-white/95 lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex min-h-full flex-col p-5">
          <Link to="/dashboard" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#7C6CF6] text-white shadow-md shadow-indigo-100">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-950">ReviewPilot AI</p>
              <p className="text-xs text-slate-500">Google review manager</p>
            </div>
          </Link>

          <nav className="mt-8 grid gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                    isActive
                      ? 'bg-[#EEF2FF] text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                      : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-8">
            <div className="rounded-2xl border border-indigo-100 bg-[#F5F3FF]/70 p-3">
              <p className="truncate text-xs font-medium text-slate-500">Signed in as</p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-800">{user?.email}</p>
            </div>
            <Button variant="ghost" className="mt-3 w-full justify-start" onClick={handleLogout}>
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
