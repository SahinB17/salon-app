import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { PageWrapper } from '../components/ui/PageWrapper';
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
    <PageWrapper className="flex flex-col min-h-screen bg-[#FAFAFA] dark:bg-[#121212] pb-24 lg:pb-8 transition-colors">
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-12 lg:pt-16 pb-4 bg-[#FAFAFA] dark:bg-[#121212] shadow-sm sticky top-0 z-10 transition-colors">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Rezervasiyalarım</h1>
      </div>

      <div className="px-4 mt-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
               <div key={i} className="w-full bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border-0 transition-colors">
                 <div className="flex justify-between items-start mb-3">
                   <div className="h-4 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded w-32" />
                   <div className="h-5 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded w-16" />
                 </div>
                 <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 flex justify-between items-center">
                   <div className="space-y-2">
                     <div className="h-4 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded w-24" />
                     <div className="h-3 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded w-16" />
                   </div>
                   <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-full" />
                 </div>
               </div>
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
                <Card key={apt.id} className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-sm bg-white dark:bg-zinc-900 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 transition-colors">
                        {apt.salon?.name || 'Salon'}
                      </h3>
                      <p className="flex items-center text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{apt.salon?.address || 'Ünvan yoxdur'}</span>
                      </p>
                    </div>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                  
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 flex justify-between items-center transition-colors">
                    <div>
                      <div className="font-semibold text-zinc-950 dark:text-zinc-50 text-sm">
                        {apt.service?.name || 'Xidmət'}
                      </div>
                      <div className="flex items-center text-zinc-500 dark:text-zinc-400 text-xs mt-1.5 gap-3">
                        <span className="flex items-center">
                          <CalendarIcon className="w-3 h-3 mr-1 text-zinc-400" />
                          {start.toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-zinc-400" />
                          {start.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    {apt.service?.price && (
                      <div className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">
                        {apt.service.price} ₼
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
