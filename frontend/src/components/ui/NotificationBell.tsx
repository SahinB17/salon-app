import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import api from '../../lib/api';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

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

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-700 dark:text-zinc-300 active:scale-95"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center border border-white dark:border-zinc-900 transition-colors">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150 transition-colors">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between transition-colors">
            <h3 className="font-bold text-zinc-950 dark:text-zinc-50 text-sm transition-colors">Bildirişlər</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {markAllReadMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5" />
                )}
                Hamısını oxundu et
              </button>
            )}
          </div>

          <div className="max-h-[350px] overflow-y-auto divide-y divide-zinc-50 dark:divide-zinc-800/50 transition-colors">
            {isLoading ? (
              <div className="p-8 text-center text-zinc-400 dark:text-zinc-500 transition-colors">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-zinc-400 dark:text-zinc-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400 transition-colors">
                Heç bir bildiriş yoxdur.
              </div>
            ) : (
              notifications.map((n: any) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markReadMutation.mutate(n.id)}
                  className={`p-4 transition-colors cursor-pointer text-left ${n.is_read ? 'bg-white dark:bg-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50' : 'bg-blue-50/40 dark:bg-blue-900/10 hover:bg-blue-50/70 dark:hover:bg-blue-900/20 border-l-[3px] border-blue-500 dark:border-blue-400'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-bold transition-colors ${n.is_read ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-950 dark:text-zinc-50'}`}>
                      {n.title}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 transition-colors">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed transition-colors">
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
