import { Search, MapPin, Star, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export default function Home() {
  const navigate = useNavigate();

  const { data: popularSalons = [], isLoading } = useQuery({
    queryKey: ['salons'],
    queryFn: async () => {
      const response = await api.get('/api/v1/salons/');
      return response.data;
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans pb-6">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header / Greeting */}
        <div className="px-4 pt-12 lg:pt-16 pb-6 bg-white rounded-b-3xl shadow-sm border-b border-zinc-100">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Salam! 👋</h1>
        <p className="text-zinc-500 mt-1">Həftəsonu üçün özünə vaxt ayır ✨</p>
        
        {/* Visual Search Box (Touch Target) */}
        <div 
          onClick={() => navigate('/salons')}
          className="mt-6 flex items-center bg-zinc-100/80 rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform h-14"
        >
          <Search className="w-5 h-5 text-zinc-400 mr-3" />
          <span className="text-zinc-500 font-medium">Salon və ya xidmət axtar...</span>
        </div>
        </div>

        {/* Main Content */}
        <div className="px-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-zinc-900">Populyar Salonlar</h2>
            <span onClick={() => navigate('/salons')} className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors">Hamısı</span>
          </div>

          {/* Horizontal Scrollable Cards on Mobile, Grid on Desktop */}
          <div className="flex lg:grid overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory gap-4 pb-4 lg:pb-0 -mx-4 lg:mx-0 px-4 lg:px-0 scrollbar-hide lg:grid-cols-3 xl:grid-cols-4">
            {isLoading ? (
              // Loading skeleton
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="min-w-[260px] lg:min-w-0 h-[240px] bg-zinc-200 animate-pulse rounded-2xl snap-center" />
              ))
            ) : (
            popularSalons.map((salon: any) => (
              <Card 
                key={salon.id} 
                onClick={() => navigate(`/salons/${salon.id}`)}
                className="min-w-[260px] lg:min-w-0 snap-center rounded-2xl overflow-hidden border-0 shadow-sm active:scale-[0.98] lg:hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <div className="h-32 bg-zinc-200 w-full relative">
                   <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-zinc-800">
                     Salon
                   </div>
                </div>
                <div className="p-4 bg-white">
                  <h3 className="font-bold text-zinc-900 truncate">{salon.name}</h3>
                  <div className="flex items-center text-zinc-500 mt-1 text-sm">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    <span className="truncate">{salon.address || 'Ünvan yoxdur'}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-amber-500 font-medium text-sm">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      5.0
                    </div>
                    <div className="flex items-center text-zinc-400 text-xs font-medium">
                       <Clock className="w-3.5 h-3.5 mr-1" /> Bax
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
          </div>
        </div>

        <div className="px-4 mt-6 lg:mt-10 mb-8">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Kateqoriyalar</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
             <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex flex-col items-center justify-center h-24 lg:h-32 active:scale-[0.98] lg:hover:scale-[1.02] transition-transform cursor-pointer">
                <span className="text-2xl lg:text-3xl mb-1">💇‍♀️</span>
                <span className="font-semibold text-zinc-800 text-sm lg:text-base">Saç</span>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex flex-col items-center justify-center h-24 lg:h-32 active:scale-[0.98] lg:hover:scale-[1.02] transition-transform cursor-pointer">
                <span className="text-2xl lg:text-3xl mb-1">💅</span>
                <span className="font-semibold text-zinc-800 text-sm lg:text-base">Dırnaq</span>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex flex-col items-center justify-center h-24 lg:h-32 active:scale-[0.98] lg:hover:scale-[1.02] transition-transform cursor-pointer">
                <span className="text-2xl lg:text-3xl mb-1">🧔</span>
                <span className="font-semibold text-zinc-800 text-sm lg:text-base">Bərbər</span>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex flex-col items-center justify-center h-24 lg:h-32 active:scale-[0.98] lg:hover:scale-[1.02] transition-transform cursor-pointer">
                <span className="text-2xl lg:text-3xl mb-1">💆‍♀️</span>
                <span className="font-semibold text-zinc-800 text-sm lg:text-base">Masaj</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
