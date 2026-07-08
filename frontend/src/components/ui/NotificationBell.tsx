import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Loader2, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch notifications, poll every 10 seconds
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return [];
      const res = await api.get('/api/v1/notifications/');
      return res.data;
    },
    enabled: !!localStorage.getItem('token'),
    refetchInterval: 10000, // 10 seconds polling
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.patch(`/api/v1/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/v1/notifications/read-all');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (n: any) => {
    if (!n.is_read) {
      markReadMutation.mutate(n.id);
    }
    setIsOpen(false);
    
    // Navigate based on user role
    const role = localStorage.getItem('role');
    if (role === 'salon_admin' || role === 'system_admin') {
      navigate('/admin/appointments');
    } else {
      navigate('/appointments');
    }
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800 shadow-sm transition-all active:scale-95 group"
      >
        <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden z-[100]"
          >
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-zinc-950 dark:text-zinc-50 text-sm">Bildirişlər</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5 block">
                    {unreadCount} yeni bildirişiniz var
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {markAllReadMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5" />
                  )}
                  Oxundu et
                </button>
              )}
            </div>

            <div className="max-h-[350px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/50 custom-scrollbar">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                  <Inbox className="w-8 h-8 mb-2 opacity-40 text-zinc-400 dark:text-zinc-500" />
                  <span className="text-xs font-medium">Heç bir bildiriş yoxdur</span>
                </div>
              ) : (
                notifications.map((n: any) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 transition-colors cursor-pointer text-left relative ${
                      n.is_read 
                        ? 'bg-transparent hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30' 
                        : 'bg-emerald-500/[0.03] dark:bg-emerald-400/[0.02] hover:bg-emerald-500/[0.06] dark:hover:bg-emerald-400/[0.04]'
                    }`}
                  >
                    {!n.is_read && (
                      <div className="absolute left-2.5 top-[22px] w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></div>
                    )}
                    <div className="pl-3.5">
                      <div className="flex justify-between items-start mb-1 gap-4">
                        <span className={`text-xs font-bold ${n.is_read ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-900 dark:text-zinc-50'}`}>
                          {n.title}
                        </span>
                        <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 shrink-0">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
