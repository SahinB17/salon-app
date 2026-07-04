import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import api from '../../lib/api';
import { Users, Calendar, DollarSign, TrendingUp, Store, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await api.get('/api/v1/users/me');
      return res.data;
    }
  });

  // Fetch admin's salons
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

  // Fetch daily report
  const { data: dailyReport, isLoading: isDailyLoading } = useQuery({
    queryKey: ['dailyReport', selectedSalonId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/salons/${selectedSalonId}/reports?report_type=daily`);
      return res.data;
    },
    enabled: !!selectedSalonId
  });

  // Fetch monthly report
  const { data: monthlyReport, isLoading: isMonthlyLoading } = useQuery({
    queryKey: ['monthlyReport', selectedSalonId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/salons/${selectedSalonId}/reports?report_type=monthly`);
      return res.data;
    },
    enabled: !!selectedSalonId
  });

  // Fetch today's appointments count
  const { data: todayAppointments = [] } = useQuery({
    queryKey: ['todayAppointments', selectedSalonId],
    queryFn: async () => {
      if (!selectedSalonId) return [];
      const res = await api.get(`/api/v1/appointments/salon/${selectedSalonId}`);
      const today = new Date().toISOString().split('T')[0];
      return res.data.filter((a: any) => a.start_time?.startsWith(today));
    },
    enabled: !!selectedSalonId
  });

  const isLoading = isDailyLoading || isMonthlyLoading;

  // Calculate today's revenue from daily report
  const todayStr = new Date().toISOString().split('T')[0];
  const todayData = dailyReport?.data?.find((d: any) => d.date === todayStr);
  const todayRevenue = todayData?.revenue || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Xoş gəldiniz, {user?.full_name}! 👋</h1>
          <p className="text-zinc-500 mt-1">Salon biznesinizin ümumi vəziyyəti</p>
        </div>

        {salons.length > 1 && (
          <select
            className="h-11 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 min-w-[200px]"
            value={selectedSalonId || ''}
            onChange={(e) => setSelectedSalonId(Number(e.target.value))}
            disabled={isSalonsLoading}
          >
            {salons.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      {isSalonsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      ) : salons.length === 0 ? (
        <Card className="p-8 border-0 shadow-sm rounded-2xl text-center">
          <Store className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-900 mb-2">Hələ salonunuz yoxdur</h3>
          <p className="text-zinc-500">Əvvəlcə "Salonlarım" bölməsindən salon yaradın.</p>
        </Card>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-0 shadow-sm rounded-2xl">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-zinc-500">Bugünkü Rezervasiyalar</h3>
              </div>
              {isLoading ? (
                <div className="h-8 bg-zinc-100 rounded-lg animate-pulse w-16" />
              ) : (
                <p className="text-2xl font-bold text-zinc-900">{todayAppointments.length}</p>
              )}
            </Card>

            <Card className="p-4 border-0 shadow-sm rounded-2xl">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-zinc-500">Aylıq Gəlir</h3>
              </div>
              {isLoading ? (
                <div className="h-8 bg-zinc-100 rounded-lg animate-pulse w-24" />
              ) : (
                <p className="text-2xl font-bold text-zinc-900">{(monthlyReport?.total_revenue || 0).toFixed(0)} ₼</p>
              )}
            </Card>

            <Card className="p-4 border-0 shadow-sm rounded-2xl">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-zinc-500">Ümumi Müştərilər</h3>
              </div>
              {isLoading ? (
                <div className="h-8 bg-zinc-100 rounded-lg animate-pulse w-16" />
              ) : (
                <p className="text-2xl font-bold text-zinc-900">{monthlyReport?.total_customers || 0}</p>
              )}
            </Card>

            <Card className="p-4 border-0 shadow-sm rounded-2xl">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-zinc-500">Bugünkü Gəlir</h3>
              </div>
              {isLoading ? (
                <div className="h-8 bg-zinc-100 rounded-lg animate-pulse w-20" />
              ) : (
                <p className="text-2xl font-bold text-zinc-900">{todayRevenue.toFixed(0)} ₼</p>
              )}
            </Card>
          </div>

          {/* Revenue Breakdown Table */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">Gündəlik Gəlir Hesabatı</h2>
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-zinc-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                </div>
              ) : !dailyReport?.data?.length ? (
                <div className="p-8 text-center text-zinc-500">Hələ heç bir hesabat məlumatı yoxdur.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-100">
                        <th className="px-6 py-3 text-sm font-semibold text-zinc-600">Tarix</th>
                        <th className="px-6 py-3 text-sm font-semibold text-zinc-600">Gəlir</th>
                        <th className="px-6 py-3 text-sm font-semibold text-zinc-600">Müştəri sayı</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {dailyReport.data.slice(-10).reverse().map((row: any) => (
                        <tr key={row.date} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-3 text-sm text-zinc-900 font-medium">{row.date}</td>
                          <td className="px-6 py-3 text-sm text-zinc-900">{row.revenue.toFixed(0)} ₼</td>
                          <td className="px-6 py-3 text-sm text-zinc-500">{row.customers} nəfər</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
