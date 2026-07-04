import { Outlet, NavLink } from 'react-router-dom';
import { Home, Search, Calendar, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function MainLayout() {
  const navItems = [
    { name: 'Ana Səhifə', icon: Home, path: '/' },
    { name: 'Axtarış', icon: Search, path: '/salons' },
    { name: 'Rezervasiya', icon: Calendar, path: '/appointments' },
    { name: 'Profil', icon: User, path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <main>
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-2 pb-safe pt-1 z-50">
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
  );
}
