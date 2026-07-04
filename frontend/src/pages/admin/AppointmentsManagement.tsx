import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Check, X, Calendar as CalendarIcon, Clock, User, Scissors } from 'lucide-react';
import api from '../../lib/api';

export default function AppointmentsManagement() {
  const queryClient = useQueryClient();

  // Get user to know owner_id
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await api.get('/api/v1/users/me');
      return res.data;
    }
  });

  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null);

  // Fetch admin's salons to get their IDs
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

  // Fetch appointments for this salon
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Rezervasiyalar</h1>
          <p className="text-zinc-500 mt-1">Sizin salona gələn bütün rezervasiyalar</p>
        </div>
        
        <div className="flex items-center gap-4">
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

      <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-400">Yüklənir...</div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
             <CalendarIcon className="w-12 h-12 text-zinc-300 mb-4" />
             <h3 className="text-lg font-medium text-zinc-900">Heç bir rezervasiya yoxdur</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                        <span className="font-medium text-zinc-900">ID: {apt.customer_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-zinc-700">
                        <Scissors className="w-4 h-4 mr-2 text-zinc-400" />
                        {apt.service_id}
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
                        {apt.status === 'confirmed' ? 'Təsdiqlənib' : 
                         apt.status === 'cancelled' ? 'Ləğv edilib' : 
                         apt.status === 'completed' ? 'Tamamlanıb' : 'Gözləyir'}
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
        )}
      </div>
    </div>
  );
}
