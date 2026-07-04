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
      const res = await api.get('/api/v1/notifications/');
      return res.data;
    },
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
        className="relative w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-700 active:scale-95"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center border border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-zinc-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-bold text-zinc-950 text-sm">Bildirişlər</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1 transition-colors disabled:opacity-50"
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

          <div className="max-h-[350px] overflow-y-auto divide-y divide-zinc-50">
            {isLoading ? (
              <div className="p-8 text-center text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-zinc-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-500">
                Heç bir bildiriş yoxdur.
              </div>
            ) : (
              notifications.map((n: any) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markReadMutation.mutate(n.id)}
                  className={`p-4 transition-colors cursor-pointer text-left ${n.is_read ? 'bg-white hover:bg-zinc-50/50' : 'bg-blue-50/40 hover:bg-blue-50/70 border-l-[3px] border-blue-500'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-bold ${n.is_read ? 'text-zinc-700' : 'text-zinc-950'}`}>
                      {n.title}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
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
