import { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Map } from '../components/ui/Map';
import api from '../lib/api';

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list'|'map'>('list');
  const debouncedQuery = useDebounce(query, 500);

  const { data: results = [], isLoading, isError } = useQuery({
    queryKey: ['searchSalons', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const response = await api.get(`/api/v1/salons/search/?query=${encodeURIComponent(debouncedQuery)}`);
      return response.data;
    },
    enabled: debouncedQuery.trim().length > 0
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] pb-24 lg:pb-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Sticky Header with Search Input */}
        <div className="sticky top-0 z-10 bg-[#FAFAFA] pt-12 lg:pt-16 pb-4">
          <div className="px-4">
            <h1 className="text-xl font-bold text-zinc-900 mb-4">Axtarış</h1>
            <div className="relative max-w-2xl">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <Input 
                autoFocus
                className="pl-12 h-12 bg-zinc-100/80 border-transparent focus:bg-white"
                placeholder="Salon adı, xidmət və ya ünvan..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {/* View Mode Toggle */}
            <div className="flex bg-zinc-100 p-1 rounded-xl w-max mt-4">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
              >
                Siyahı
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
              >
                Xəritə
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="px-4 mt-6 max-w-7xl mx-auto w-full">
        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {[1, 2, 3].map(i => (
                <div key={i} className="w-full h-28 bg-zinc-200 animate-pulse rounded-2xl" />
             ))}
           </div>
        ) : isError ? (
           <div className="text-center text-red-500 mt-10">
             Axtarış zamanı xəta baş verdi. Yenidən cəhd edin.
           </div>
        ) : debouncedQuery && results.length === 0 ? (
           <div className="text-center text-zinc-500 mt-10">
             "{debouncedQuery}" üzrə heç nə tapılmadı
           </div>
        ) : !debouncedQuery ? (
           <div className="text-center text-zinc-400 mt-10">
             Axtarmaq üçün yuxarıdakı xanaya yazın
           </div>
        ) : viewMode === 'map' ? (
           <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-zinc-100 bg-white p-2">
             <Map salons={results} className="w-full h-[60vh] rounded-xl z-0" />
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {results.map((salon: any) => (
               <Card 
                 key={salon.id} 
                 onClick={() => navigate(`/salons/${salon.id}`)}
                 className="flex flex-row p-3 rounded-2xl border-0 shadow-sm active:scale-[0.98] transition-transform cursor-pointer bg-white"
               >
                 <div className="w-24 h-24 bg-zinc-200 rounded-xl flex-shrink-0 overflow-hidden">
                   {salon.image_url && (
                     <img src={`http://localhost:8000${salon.image_url}`} alt={salon.name} className="w-full h-full object-cover" />
                   )}
                 </div>
                 <div className="ml-4 flex flex-col justify-center flex-1">
                   <h3 className="font-bold text-zinc-900 line-clamp-1">{salon.name}</h3>
                   <div className="flex items-center text-zinc-500 mt-1 text-sm">
                     <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                     <span className="line-clamp-1">{salon.address || 'Ünvan yoxdur'}</span>
                   </div>
                   <div className="flex items-center text-amber-500 font-medium text-sm mt-2">
                     <Star className="w-4 h-4 fill-current mr-1" />
                     {salon.average_rating ? salon.average_rating.toFixed(1) : '0.0'}
                   </div>
                 </div>
               </Card>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}
