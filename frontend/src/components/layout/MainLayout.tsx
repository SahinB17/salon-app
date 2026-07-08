import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Calendar, User, Sun, Moon, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { NotificationBell } from '../ui/NotificationBell';
import { useTheme } from '../ThemeProvider';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { AuthModal } from '../auth/AuthModal';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsAuthModalOpen(true);
    window.addEventListener('open-login-modal', handleOpen);
    
    if (location.state?.requireLogin) {
      setIsAuthModalOpen(true);
      // Clear state so it doesn't reopen on refresh
      window.history.replaceState({}, '');
    }
    
    return () => window.removeEventListener('open-login-modal', handleOpen);
  }, [location.state]);
  const navItems = [
    { name: 'Ana Səhifə', icon: Home, path: '/' },
    { name: 'Axtarış', icon: Search, path: '/salons' },
    { name: 'Rezervasiya', icon: Calendar, path: '/appointments', requiresAuth: true },
    { name: 'Profil', icon: User, path: '/profile', requiresAuth: true },
  ];

  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const isSalonDetailPage = location.pathname.match(/\/salons\/\d+/);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const response = await api.get('/api/v1/users/me');
      return response.data;
    },
    enabled: !!localStorage.getItem('token')
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] lg:flex transition-colors">
      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col fixed inset-y-0 left-0 bg-white dark:bg-[#121212] border-r border-zinc-200 dark:border-zinc-900 z-50 transition-colors">
        <div className="flex h-20 items-center px-8 border-b border-zinc-100 dark:border-zinc-900/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">SalonApp</h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all font-medium",
                  isActive 
                    ? "bg-zinc-100 dark:bg-amber-500/10 text-zinc-950 dark:text-amber-500" 
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
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

        {/* User Profile */}
        <div className="p-6 border-t border-zinc-100 dark:border-zinc-900/50 mt-auto">
          {localStorage.getItem('token') ? (
            <div className="flex items-center justify-between p-2 -m-2 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group" onClick={() => navigate('/profile')}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-300 dark:border-zinc-700">
                  {user?.image_url ? (
                    <img src={`http://${window.location.hostname}${window.location.port === '5173' ? ':8000' : ''}${user.image_url}`} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500">
                      {user?.full_name ? user.full_name.substring(0,2).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-50 line-clamp-1">{user?.full_name || 'İstifadəçi'}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full h-11 bg-amber-500 text-amber-950 font-bold rounded-2xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
            >
              Giriş et
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen pb-20 lg:pb-0 relative">
        {!isSalonDetailPage && (
          <div className="fixed top-3 left-4 right-4 lg:top-6 lg:right-8 lg:left-auto z-50 flex items-center justify-between lg:justify-end gap-3 pointer-events-none">
            {/* Mobile Top Left - Login Button or Logo */}
            <div className="lg:hidden pointer-events-auto">
              {!localStorage.getItem('token') && (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 h-10 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/80 shadow-sm text-zinc-900 dark:text-zinc-50 font-bold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-center text-sm"
                >
                  Giriş
                </button>
              )}
            </div>

            {/* Right side floating buttons */}
            <div className="flex items-center gap-3 pointer-events-auto">
              <button 
                onClick={() => {
                  if (!localStorage.getItem('token')) {
                    setIsAuthModalOpen(true);
                  } else {
                    navigate('/favorites');
                  }
                }}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 border border-zinc-200/50 dark:border-zinc-800/80 shadow-sm transition-all active:scale-95"
                title="Seçilmişlər"
              >
                <Heart className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800/80 shadow-sm transition-all active:scale-95"
                title={isDark ? 'Açıq rejim' : 'Qaranlıq rejim'}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {localStorage.getItem('token') && <NotificationBell />}
            </div>
          </div>
        )}

        <main className="flex-1 w-full">
          <div className="w-full max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation (Hidden on desktop) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 pb-safe pt-1 z-50 transition-colors">
          <div className="flex justify-around items-center h-16 w-full px-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={(e) => {
                  if (item.requiresAuth && !localStorage.getItem('token')) {
                    e.preventDefault();
                    setIsAuthModalOpen(true);
                  }
                }}
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
          </div>
        </nav>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    </div>
  );
}
