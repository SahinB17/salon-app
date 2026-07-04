import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import api from '../lib/api';

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  pending: { label: 'Gözləyir', variant: 'warning' },
  confirmed: { label: 'Təsdiqləndi', variant: 'success' },
  cancelled: { label: 'Ləğv edildi', variant: 'danger' },
  completed: { label: 'Tamamlandı', variant: 'default' },
};

export default function Appointments() {
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['myAppointments'],
    queryFn: async () => {
      const response = await api.get('/api/v1/appointments/me');
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
          <EmptyState 
            icon={CalendarIcon}
            title="Rezervasiya yoxdur"
            description="Siz hələ heç bir salona yazılmamısınız."
            buttonText="Salon Axtar"
            buttonLink="/salons"
          />
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
