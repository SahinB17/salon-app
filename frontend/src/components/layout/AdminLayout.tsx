import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, Scissors, CalendarCheck, LogOut, Users, Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { cn } from '../../lib/utils';
import { NotificationBell } from '../ui/NotificationBell';

export default function AdminLayout() {
  const navItems = [
    { name: 'Panel', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Salonlarım', icon: Store, path: '/admin/salons' },
    { name: 'Xidmətlər', icon: Scissors, path: '/admin/services' },
    { name: 'İşçilər', icon: Users, path: '/admin/staff' },
    { name: 'Rezervasiyalar', icon: CalendarCheck, path: '/admin/appointments' },
  ];

  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 lg:flex transition-colors">
      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col fixed inset-y-0 left-0 bg-zinc-950 dark:bg-zinc-900 text-white z-50 border-r border-transparent dark:border-zinc-800 transition-colors">
        <div className="flex h-16 items-center px-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold tracking-tight text-white">Salon Admin</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium",
                  isActive ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl transition-colors font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10"
          >
            <LogOut className="w-5 h-5" />
            <span>Çıxış</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen pb-20 lg:pb-0 relative">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-40 h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 transition-colors">
          <div className="flex items-center lg:hidden">
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-50 dark:to-zinc-400 bg-clip-text text-transparent">Salon Admin</span>
          </div>
          <div className="hidden lg:block text-xs font-semibold text-zinc-400 dark:text-zinc-500">
            {new Date().toLocaleDateString('az-AZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800 shadow-sm transition-all active:scale-95"
              title={isDark ? 'Açıq rejim' : 'Qaranlıq rejim'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation (Hidden on desktop) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 pb-safe pt-1 z-50 transition-colors">
          <div className="flex justify-around items-center h-16 w-full px-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center flex-1 min-w-0 h-full space-y-1 transition-colors px-1 text-center",
                    isActive ? "text-zinc-950 dark:text-zinc-50" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5px] text-zinc-950 dark:text-zinc-50")} />
                    <span className={cn("text-[9px] font-medium truncate w-full", isActive ? "font-bold text-zinc-950 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400")}>
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center flex-1 min-w-0 h-full space-y-1 transition-colors px-1 text-center text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[9px] font-medium truncate w-full text-zinc-500 dark:text-zinc-400">Çıxış</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
