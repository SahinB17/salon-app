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
        <div className="fixed top-3 right-4 lg:top-4 lg:right-6 z-50 flex items-center gap-3">
          <button 
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-full bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shadow-sm transition-colors active:scale-95"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <NotificationBell />
        </div>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation (Hidden on desktop) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-2 pb-safe pt-1 z-50 transition-colors">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors min-w-[64px]",
                    isActive ? "text-zinc-950 dark:text-zinc-50" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
                    <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors min-w-[64px] text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-[10px] font-medium">Çıxış</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
