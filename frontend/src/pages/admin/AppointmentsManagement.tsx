import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Check, X, Calendar as CalendarIcon, Clock, User, Scissors, ChevronLeft, ChevronRight, List, LayoutGrid } from 'lucide-react';
import api from '../../lib/api';

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger'; color: string }> = {
  pending:   { label: 'Gözləyir',    variant: 'warning', color: 'bg-amber-500' },
  confirmed: { label: 'Təsdiqlənib', variant: 'success', color: 'bg-emerald-500' },
  cancelled: { label: 'Ləğv edilib', variant: 'danger',  color: 'bg-red-500' },
  completed: { label: 'Tamamlanıb',  variant: 'default', color: 'bg-zinc-400' },
};

function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  start.setDate(start.getDate() + diff);
  
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 - 20:00
const DAY_NAMES = ['B.e.', 'Ç.a.', 'Ç.', 'C.a.', 'C.', 'Ş.', 'B.'];

export default function AppointmentsManagement() {
  const queryClient = useQueryClient();
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await api.get('/api/v1/users/me');
      return res.data;
    }
  });

  const { data: salons = [], isLoading: isSalonsLoading } = useQuery({
    queryKey: ['adminSalons'],
    queryFn: async () => {
      const res = await api.get('/api/v1/salons/');
      const mySalons = res.data.filter((s: any) => s.owner_id === user?.id);
      if (mySalons.length > 0 && !selectedSalonId) {
        setSelectedSalonId(mySalons[0].id);
      }
      return mySalons;
    },
    enabled: !!user?.id
  });

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['adminAppointments', selectedSalonId],
    queryFn: async () => {
      if (!selectedSalonId) return [];
      const res = await api.get(`/api/v1/appointments/salon/${selectedSalonId}`);
      return res.data;
    },
    enabled: !!selectedSalonId
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await api.patch(`/api/v1/appointments/${id}/status?new_status=${status}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAppointments'] });
    }
  });

  const handleUpdateStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  // Calendar helpers
  const weekDays = getWeekDays(currentWeek);
  const navigateWeek = (dir: number) => {
    const next = new Date(currentWeek);
    next.setDate(next.getDate() + dir * 7);
    setCurrentWeek(next);
  };

  const getAppointmentsForDayHour = (day: Date, hour: number) => {
    return appointments.filter((apt: any) => {
      const start = new Date(apt.start_time);
      return (
        start.getFullYear() === day.getFullYear() &&
        start.getMonth() === day.getMonth() &&
        start.getDate() === day.getDate() &&
        start.getHours() === hour
      );
    });
  };

  if (isSalonsLoading) {
    return <div className="max-w-7xl mx-auto py-12 text-center text-zinc-500">Yüklənir...</div>;
  }

  if (salons.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center">
        <p className="text-zinc-500">Aktiv salon tapılmadı. Əvvəlcə "Salonlarım" bölməsindən salon yaradın.</p>
      </div>
    );
  }

  const todayStr = new Date().toDateString();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Rezervasiyalar</h1>
          <p className="text-zinc-500 mt-1">Sizin salona gələn bütün rezervasiyalar</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex p-1 bg-zinc-100 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'calendar' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <select 
            className="h-11 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 min-w-[200px]"
            value={selectedSalonId || ''}
            onChange={(e) => setSelectedSalonId(Number(e.target.value))}
            disabled={isSalonsLoading || salons.length === 0}
          >
            <option value="" disabled>Salon seçin</option>
            {salons.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-zinc-400">Yüklənir...</div>
          ) : appointments.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
               <CalendarIcon className="w-12 h-12 text-zinc-300 mb-4" />
               <h3 className="text-lg font-medium text-zinc-900">Heç bir rezervasiya yoxdur</h3>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-zinc-100">
                {appointments.map((apt: any) => {
                  const st = statusConfig[apt.status] || statusConfig.pending;
                  return (
                    <div key={apt.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-zinc-900 text-sm">Müştəri #{apt.customer_id}</span>
                        </div>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-zinc-500">
                        <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5" />{new Date(apt.start_time).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(apt.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      {apt.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 h-10 rounded-xl text-red-600 bg-transparent border border-red-200 hover:bg-red-50"
                            onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                            disabled={updateStatusMutation.isPending}
                          >
                            <X className="w-4 h-4 mr-1" /> Ləğv
                          </Button>
                          <Button 
                            className="flex-1 h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Check className="w-4 h-4 mr-1" /> Təsdiq
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      <th className="px-6 py-4 text-sm font-semibold text-zinc-600">Müştəri</th>
                      <th className="px-6 py-4 text-sm font-semibold text-zinc-600">Xidmət</th>
                      <th className="px-6 py-4 text-sm font-semibold text-zinc-600">Tarix & Saat</th>
                      <th className="px-6 py-4 text-sm font-semibold text-zinc-600">Status</th>
                      <th className="px-6 py-4 text-sm font-semibold text-zinc-600 text-right">Əməliyyatlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {appointments.map((apt: any) => (
                      <tr key={apt.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 mr-3">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-zinc-900">Müştəri #{apt.customer_id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-zinc-700">
                            <Scissors className="w-4 h-4 mr-2 text-zinc-400" />
                            Xidmət #{apt.service_id}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-zinc-900">{new Date(apt.start_time).toLocaleDateString()}</span>
                            <span className="text-xs text-zinc-500 flex items-center mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(apt.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={
                            apt.status === 'confirmed' ? 'success' : 
                            apt.status === 'cancelled' ? 'danger' : 
                            apt.status === 'completed' ? 'default' : 'warning'
                          }>
                            {statusConfig[apt.status]?.label || apt.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {apt.status === 'pending' && (
                            <div className="flex items-center justify-end space-x-2">
                              <Button 
                                className="h-8 w-8 p-0 rounded-lg text-red-600 bg-transparent border border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 min-w-0"
                                onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                                disabled={updateStatusMutation.isPending}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              <Button 
                                className="h-8 w-8 p-0 rounded-lg bg-green-600 hover:bg-green-700 text-white min-w-0"
                                onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                                disabled={updateStatusMutation.isPending}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="space-y-4">
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <button onClick={() => navigateWeek(-1)} className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors">
              <ChevronLeft className="w-5 h-5 text-zinc-600" />
            </button>
            <div className="text-sm font-bold text-zinc-900">
              {weekDays[0].toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })} — {weekDays[6].toLocaleDateString('az-AZ', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <button onClick={() => navigateWeek(1)} className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors">
              <ChevronRight className="w-5 h-5 text-zinc-600" />
            </button>
          </div>

          {/* Calendar Grid */}
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Header Row */}
                <div className="grid grid-cols-8 border-b border-zinc-100">
                  <div className="p-3 text-xs font-medium text-zinc-400 text-center">Saat</div>
                  {weekDays.map((day, idx) => {
                    const isToday = day.toDateString() === todayStr;
                    return (
                      <div key={idx} className={`p-3 text-center ${isToday ? 'bg-zinc-900 text-white' : ''}`}>
                        <div className="text-xs font-medium opacity-70">{DAY_NAMES[idx]}</div>
                        <div className={`text-lg font-bold ${isToday ? '' : 'text-zinc-900'}`}>{day.getDate()}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Time Rows */}
                {HOURS.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b border-zinc-50 min-h-[56px]">
                    <div className="p-2 text-xs text-zinc-400 text-center flex items-start justify-center pt-3 border-r border-zinc-100">
                      {String(hour).padStart(2, '0')}:00
                    </div>
                    {weekDays.map((day, dayIdx) => {
                      const dayAppointments = getAppointmentsForDayHour(day, hour);
                      return (
                        <div key={dayIdx} className="p-1 border-r border-zinc-50 relative">
                          {dayAppointments.map((apt: any) => {
                            const st = statusConfig[apt.status] || statusConfig.pending;
                            return (
                              <div
                                key={apt.id}
                                className={`${st.color} text-white text-[10px] px-1.5 py-1 rounded-md mb-0.5 truncate leading-tight`}
                                title={`Müştəri #${apt.customer_id} - ${new Date(apt.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                              >
                                {new Date(apt.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
