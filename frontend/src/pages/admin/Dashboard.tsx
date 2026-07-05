import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import api from '../../lib/api';
import { Users, Calendar, DollarSign, TrendingUp, Store, Loader2, ChevronDown, Check } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [selectedSalonId, setSelectedSalonId] = useState<number | 'all' | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        setSelectedSalonId(mySalons.length > 1 ? 'all' : mySalons[0].id);
      }
      return mySalons;
    },
    enabled: !!user?.id
  });

  // Fetch daily report
  const { data: dailyReport, isLoading: isDailyLoading } = useQuery({
    queryKey: ['dailyReport', selectedSalonId],
    queryFn: async () => {
      if (selectedSalonId === 'all') {
        const promises = salons.map((s: any) => api.get(`/api/v1/salons/${s.id}/reports?report_type=daily`));
        const results = await Promise.all(promises);
        
        const mergedData: any = {};
        let totalRev = 0;
        let totalCust = 0;
        
        for (const res of results) {
          totalRev += res.data.total_revenue;
          totalCust += res.data.total_customers;
          for (const d of res.data.data) {
            if (!mergedData[d.date]) mergedData[d.date] = { date: d.date, revenue: 0, customers: 0 };
            mergedData[d.date].revenue += d.revenue;
            mergedData[d.date].customers += d.customers;
          }
        }
        
        const sortedData = Object.values(mergedData).sort((a: any, b: any) => a.date.localeCompare(b.date));
        return { data: sortedData, total_revenue: totalRev, total_customers: totalCust };
      }
      const res = await api.get(`/api/v1/salons/${selectedSalonId}/reports?report_type=daily`);
      return res.data;
    },
    enabled: !!selectedSalonId && salons.length > 0
  });

  // Fetch monthly report
  const { data: monthlyReport, isLoading: isMonthlyLoading } = useQuery({
    queryKey: ['monthlyReport', selectedSalonId],
    queryFn: async () => {
      if (selectedSalonId === 'all') {
        const promises = salons.map((s: any) => api.get(`/api/v1/salons/${s.id}/reports?report_type=monthly`));
        const results = await Promise.all(promises);
        
        const mergedData: any = {};
        let totalRev = 0;
        let totalCust = 0;
        
        for (const res of results) {
          totalRev += res.data.total_revenue;
          totalCust += res.data.total_customers;
          for (const d of res.data.data) {
            if (!mergedData[d.date]) mergedData[d.date] = { date: d.date, revenue: 0, customers: 0 };
            mergedData[d.date].revenue += d.revenue;
            mergedData[d.date].customers += d.customers;
          }
        }
        
        const sortedData = Object.values(mergedData).sort((a: any, b: any) => a.date.localeCompare(b.date));
        return { data: sortedData, total_revenue: totalRev, total_customers: totalCust };
      }
      const res = await api.get(`/api/v1/salons/${selectedSalonId}/reports?report_type=monthly`);
      return res.data;
    },
    enabled: !!selectedSalonId && salons.length > 0
  });

  // Fetch today's appointments count
  const { data: todayAppointments = [] } = useQuery({
    queryKey: ['todayAppointments', selectedSalonId],
    queryFn: async () => {
      if (!selectedSalonId) return [];
      const today = new Date().toLocaleDateString('en-CA');
      
      if (selectedSalonId === 'all') {
        const promises = salons.map((s: any) => api.get(`/api/v1/appointments/salon/${s.id}`));
        const results = await Promise.all(promises);
        const allAppointments = results.flatMap((res: any) => res.data);
        return allAppointments.filter((a: any) => a.start_time?.startsWith(today));
      }
      
      const res = await api.get(`/api/v1/appointments/salon/${selectedSalonId}`);
      return res.data.filter((a: any) => a.start_time?.startsWith(today));
    },
    enabled: !!selectedSalonId && salons.length > 0
  });

  const isLoading = isDailyLoading || isMonthlyLoading;

  // Calculate today's revenue from daily report using local date
  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayData = dailyReport?.data?.find((d: any) => d.date === todayStr);
  const todayRevenue = todayData?.revenue || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight transition-colors">Xoş gəldiniz, {user?.full_name}! 👋</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 transition-colors">Salon biznesinizin ümumi vəziyyəti</p>
        </div>

        {salons.length > 1 && (
          <div className="relative mt-2 sm:mt-0" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between h-11 w-full sm:w-[240px] px-4 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/80 text-white font-medium text-sm transition-all shadow-sm"
            >
              <span className="truncate">
                {selectedSalonId === 'all' ? '📊 Bütün Salonların Cəmi' : `🏪 ${salons.find((s: any) => s.id === selectedSalonId)?.name || 'Salon Seçin'}`}
              </span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full mt-2 w-full z-50 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-xl shadow-2xl p-1">
                <button
                  onClick={() => {
                    setSelectedSalonId('all');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors hover:bg-zinc-800/80 text-zinc-300 hover:text-white"
                >
                  <span className={selectedSalonId === 'all' ? 'font-medium text-white' : ''}>📊 Bütün Salonların Cəmi</span>
                  {selectedSalonId === 'all' && <Check className="w-4 h-4 text-white" />}
                </button>
                {salons.map((s: any) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedSalonId(s.id);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors hover:bg-zinc-800/80 text-zinc-300 hover:text-white mt-1"
                  >
                    <span className={selectedSalonId === s.id ? 'font-medium text-white' : ''}>🏪 {s.name}</span>
                    {selectedSalonId === s.id && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isSalonsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400 dark:text-zinc-500" />
        </div>
      ) : salons.length === 0 ? (
        <Card className="p-8 border-0 shadow-sm rounded-2xl text-center dark:bg-zinc-900 transition-colors">
          <Store className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4 transition-colors" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2 transition-colors">Hələ salonunuz yoxdur</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6 transition-colors">Admin paneldən tam istifadə etmək üçün ilk salonunuzu yaradın.</p>
          <button 
            onClick={() => window.location.href = '/admin/salons'}
            className="px-6 py-2.5 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-900 font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Salon yarat
          </button>
        </Card>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-0 shadow-sm rounded-2xl dark:bg-zinc-900 transition-colors">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 transition-colors">Bugünkü Rezervasiyalar</h3>
              </div>
              {isLoading ? (
                <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse w-16 transition-colors" />
              ) : (
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 transition-colors">{todayAppointments.length}</p>
              )}
            </Card>

            <Card className="p-4 border-0 shadow-sm rounded-2xl dark:bg-zinc-900 transition-colors">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center transition-colors">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 transition-colors">Bugünkü Gəlir</h3>
              </div>
              {isLoading ? (
                <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse w-24 transition-colors" />
              ) : (
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 transition-colors">{todayRevenue} AZN</p>
              )}
            </Card>

            <Card className="p-4 border-0 shadow-sm rounded-2xl dark:bg-zinc-900 transition-colors">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 transition-colors">Ümumi Müştərilər</h3>
              </div>
              {isLoading ? (
                <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse w-16 transition-colors" />
              ) : (
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 transition-colors">{monthlyReport?.total_customers || 0}</p>
              )}
            </Card>

            <Card className="p-4 border-0 shadow-sm rounded-2xl dark:bg-zinc-900 transition-colors">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 transition-colors">Ümumi Gəlir</h3>
              </div>
              {isLoading ? (
                <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse w-20 transition-colors" />
              ) : (
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 transition-colors">{(monthlyReport?.total_revenue || 0).toFixed(0)} ₼</p>
              )}
            </Card>
          </div>

          {/* Revenue Chart */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4 transition-colors">Gəlir Dinamikası</h2>
            <Card className="p-4 sm:p-6 border-0 shadow-sm rounded-2xl dark:bg-zinc-900 transition-colors">
              {isLoading ? (
                <div className="h-[320px] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-zinc-400 dark:text-zinc-500" />
                </div>
              ) : !dailyReport?.data?.length ? (
                <div className="h-[320px] flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                  Hələ kifayət qədər məlumat yoxdur.
                </div>
              ) : (
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dailyReport.data}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#71717a', fontSize: 12 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#71717a', fontSize: 12 }}
                        tickFormatter={(value) => `${value} ₼`}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(24, 24, 27, 0.95)', 
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                        labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                        formatter={(value) => [`${value || 0} ₼`, 'Gəlir']}
                        labelFormatter={(label) => `Tarix: ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          {/* Revenue Breakdown Table */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4 transition-colors">Gündəlik Gəlir Hesabatı</h2>
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
              {isLoading ? (
                <div className="p-8 text-center text-zinc-400 dark:text-zinc-500 transition-colors">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                </div>
              ) : !dailyReport?.data?.length ? (
                <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 transition-colors">Hələ heç bir hesabat məlumatı yoxdur.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 transition-colors">
                        <th className="px-6 py-3 text-sm font-semibold text-zinc-600 dark:text-zinc-300 transition-colors">Tarix</th>
                        <th className="px-6 py-3 text-sm font-semibold text-zinc-600 dark:text-zinc-300 transition-colors">Gəlir</th>
                        <th className="px-6 py-3 text-sm font-semibold text-zinc-600 dark:text-zinc-300 transition-colors">Müştəri sayı</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 transition-colors">
                      {dailyReport.data.slice(-10).reverse().map((row: any) => (
                        <tr key={row.date} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-3 text-sm text-zinc-900 dark:text-zinc-100 font-medium transition-colors">{row.date}</td>
                          <td className="px-6 py-3 text-sm text-zinc-900 dark:text-zinc-100 transition-colors">{row.revenue.toFixed(0)} ₼</td>
                          <td className="px-6 py-3 text-sm text-zinc-500 dark:text-zinc-400 transition-colors">{row.customers} nəfər</td>
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
