import { Outlet, NavLink } from 'react-router-dom';
import { Home, Search, Calendar, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { NotificationBell } from '../ui/NotificationBell';

export default function MainLayout() {
  const navItems = [
    { name: 'Ana Səhifə', icon: Home, path: '/' },
    { name: 'Axtarış', icon: Search, path: '/salons' },
    { name: 'Rezervasiya', icon: Calendar, path: '/appointments' },
    { name: 'Profil', icon: User, path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 lg:flex">
      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col fixed inset-y-0 left-0 bg-white border-r border-zinc-200 z-50">
        <div className="flex h-16 items-center px-6 border-b border-zinc-100">
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">SalonApp</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium",
                  isActive ? "bg-zinc-100 text-zinc-950" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
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
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen pb-20 lg:pb-0 relative">
        <div className="fixed top-3 right-4 lg:top-4 lg:right-6 z-50">
          <NotificationBell />
        </div>
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation (Hidden on desktop) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-2 pb-safe pt-1 z-50">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors min-w-[64px]",
                  isActive ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-600"
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
        </div>
      </nav>
      </div>
    </div>
  );
}
