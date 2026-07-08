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
    <PageWrapper className="flex flex-col min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] pb-24 lg:pb-8 transition-colors">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="px-4 pt-12 lg:pt-16 pb-4 bg-zinc-50/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl shadow-sm sticky top-0 z-10 border-b border-zinc-200/50 dark:border-zinc-900/50 transition-colors">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Rezervasiyalarım</h1>
        </div>

        <div className="px-4 mt-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
               <div key={i} className="w-full bg-white dark:bg-[#121212] rounded-[1.5rem] p-5 shadow-sm border border-zinc-100 dark:border-zinc-800/60 transition-colors">
                 <div className="flex justify-between items-start mb-4">
                   <div className="h-4 bg-zinc-200 dark:bg-zinc-800/80 animate-pulse rounded w-32" />
                   <div className="h-6 bg-zinc-200 dark:bg-zinc-800/80 animate-pulse rounded-full w-20" />
                 </div>
                 <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 flex justify-between items-center border border-zinc-100 dark:border-zinc-800/80">
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
                <Card key={apt.id} className="p-5 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-[#121212] transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-500">
                        {apt.salon?.name || 'Salon'}
                      </h3>
                      <p className="flex items-center text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                        <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-amber-500" />
                        <span className="line-clamp-1">{apt.salon?.address || 'Ünvan yoxdur'}</span>
                      </p>
                    </div>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                  
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 flex justify-between items-center transition-colors border border-zinc-100 dark:border-zinc-800/80">
                    <div>
                      <div className="font-semibold text-zinc-950 dark:text-zinc-50 text-sm">
                        {apt.service?.name || 'Xidmət'}
                      </div>
                      <div className="flex items-center text-zinc-500 dark:text-zinc-400 text-xs mt-2 gap-3">
                        <span className="flex items-center font-medium bg-white dark:bg-zinc-800 px-2 py-1 rounded-md shadow-sm border border-zinc-100 dark:border-zinc-700/50">
                          <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                          {start.toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="flex items-center font-medium bg-white dark:bg-zinc-800 px-2 py-1 rounded-md shadow-sm border border-zinc-100 dark:border-zinc-700/50">
                          <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                          {start.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    {apt.service?.price && (
                      <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
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
    </div>
  </PageWrapper>
  );
}
