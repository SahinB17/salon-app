import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Clock, MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import api from '../lib/api';

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  pending: { label: 'Gözləyir', variant: 'warning' },
  confirmed: { label: 'Təsdiqləndi', variant: 'success' },
  cancelled: { label: 'Ləğv edildi', variant: 'danger' },
  completed: { label: 'Tamamlandı', variant: 'default' },
};

export default function Appointments() {
  const navigate = useNavigate();
  
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['myAppointments'],
    queryFn: async () => {
      const response = await api.get('/api/v1/appointments/me');
      // Assuming backend returns a list of appointments.
      // We might need to fetch salon details for each, or assume backend includes it.
      // For now we will render what is available.
      return response.data;
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100 px-4 pt-12 pb-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-zinc-900">Rezervasiyalarım</h1>
      </div>

      <div className="px-4 mt-6">
        {isLoading ? (
          <div className="space-y-4">
             {[1, 2].map(i => (
                <div key={i} className="w-full h-36 bg-zinc-200 animate-pulse rounded-2xl" />
             ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
               <CalendarIcon className="w-8 h-8 text-zinc-300" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 mb-2">Heç bir rezervasiya yoxdur</h2>
            <p className="text-sm text-zinc-500 mb-6">Siz hələ heç bir salona yazılmamısınız.</p>
            <Button onClick={() => navigate('/salons')}>
               <Search className="w-4 h-4 mr-2" />
               Salon Axtar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt: any) => {
              const start = new Date(apt.start_time);
              const config = statusConfig[apt.status] || { label: apt.status, variant: 'default' };

              return (
                <Card key={apt.id} className="p-4 rounded-2xl border-0 shadow-sm bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center text-zinc-900 font-bold">
                       <CalendarIcon className="w-4 h-4 mr-1.5 text-zinc-400" />
                       {start.toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                  
                  <div className="bg-zinc-50 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-zinc-900 text-sm">{apt.service_id} (Xidmət)</div>
                      <div className="flex items-center text-zinc-500 text-xs mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {start.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center text-zinc-500 text-xs font-medium">
                     <MapPin className="w-3.5 h-3.5 mr-1" />
                     Salon ID: {apt.salon_id}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
