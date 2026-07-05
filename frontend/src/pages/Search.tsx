import { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Star, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Map } from '../components/ui/Map';
import { EmptyState } from '../components/ui/EmptyState';
import { PageWrapper } from '../components/ui/PageWrapper';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { motion } from 'framer-motion';
import api from '../lib/api';
import Fuse from 'fuse.js';
import { DEFAULT_SALON_IMAGE } from '../lib/constants';

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
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<'list'|'map'>('list');
  const debouncedQuery = useDebounce(query, 500);

  // Sync state if parameter changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  const { data: results = [], isLoading, isError } = useQuery({
    queryKey: ['searchSalons', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const response = await api.get(`/api/v1/salons/search/?query=${encodeURIComponent(debouncedQuery)}`);
      return response.data;
    },
    enabled: !!debouncedQuery.trim()
  });

  const matchedServices: any[] = [];
  const matchedSalons: any[] = [];

  if (results.length > 0 && debouncedQuery.trim()) {
    // Bütün xidmətləri bir massivə yığırıq
    const allServices = results.flatMap((salon: any) => 
      (salon.services || []).map((s: any) => ({
        ...s,
        salon: { id: salon.id, name: salon.name, address: salon.address, image_url: salon.image_url }
      }))
    );

    // Fuse.js ilə Xidmətləri qruplaşdırırıq
    const serviceFuse = new Fuse(allServices, {
      keys: ['name', 'description'],
      threshold: 0.4
    });
    const serviceMatches = serviceFuse.search(debouncedQuery);
    serviceMatches.forEach(res => matchedServices.push(res.item));

    // Fuse.js ilə Salonları qruplaşdırırıq
    const salonFuse = new Fuse(results, {
      keys: ['name', 'address'],
      threshold: 0.4
    });
    const salonMatches = salonFuse.search(debouncedQuery);
    salonMatches.forEach(res => matchedSalons.push(res.item));

    // Əgər backend nəsə tapıbsa amma Fuse.js heç birini filterdən keçirmədisə (çox böyük typo olanda)
    results.forEach((salon: any) => {
      const isMatchedSalon = matchedSalons.some(s => s.id === salon.id);
      const hasMatchedService = matchedServices.some(s => s.salon.id === salon.id);
      if (!isMatchedSalon && !hasMatchedService) {
         matchedSalons.push(salon);
      }
    });
  }

  return (
    <PageWrapper className="flex flex-col min-h-screen bg-[#FAFAFA] dark:bg-[#121212] pb-24 lg:pb-8 transition-colors">
      <div className="max-w-md md:max-w-7xl mx-auto w-full">
        {/* Sticky Header with Search Input */}
        <div className="sticky top-0 z-10 bg-[#FAFAFA] dark:bg-[#121212] pt-12 lg:pt-16 pb-4 transition-colors">
          <div className="px-4">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Axtarış</h1>
            <div className="relative max-w-2xl">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
              <Input 
                autoFocus
                className="pl-12 h-12 bg-zinc-100/80 dark:bg-zinc-800/50 border-transparent focus:bg-white dark:focus:bg-zinc-900"
                placeholder="Salon adı, xidmət və ya ünvan..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {/* View Mode Toggle */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl w-max mt-4 transition-colors">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 dark:text-zinc-400'}`}
              >
                Siyahı
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${viewMode === 'map' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 dark:text-zinc-400'}`}
              >
                Xəritə
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="px-4 mt-6 max-w-md md:max-w-7xl mx-auto w-full">
        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {[1, 2, 3, 4, 5, 6].map(i => (
                <SkeletonCard key={i} />
             ))}
           </div>
        ) : isError ? (
           <div className="text-center text-red-500 mt-10">
             Axtarış zamanı xəta baş verdi. Yenidən cəhd edin.
           </div>
        ) : debouncedQuery && results.length === 0 ? (
           <EmptyState 
             icon={SearchIcon}
             title="Heç nə tapılmadı"
             description={`"${debouncedQuery}" üzrə salon və ya xidmət yoxdur.`}
           />
        ) : !debouncedQuery ? (
           <div className="text-center text-zinc-400 dark:text-zinc-500 mt-10">
             Axtarmaq üçün yuxarıdakı xanaya yazın
           </div>
        ) : viewMode === 'map' ? (
           <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2">
             <Map salons={results} className="w-full h-[60vh] rounded-xl z-0" />
           </div>
        ) : (
           <div className="space-y-8">
             {/* Matched Services Section */}
             {matchedServices.length > 0 && (
               <div>
                 <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4 tracking-tight">Tapılan Xidmətlər</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {matchedServices.map((service, idx) => (
                     <Card 
                       key={`srv-${service.id}-${idx}`}
                       onClick={() => navigate(`/salons/${service.salon.id}`)}
                       className="p-4 rounded-2xl border-0 shadow-sm active:scale-[0.98] lg:hover:scale-[1.02] transition-transform cursor-pointer bg-white dark:bg-zinc-900 flex justify-between items-center"
                     >
                        <div>
                          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">{service.name}</h3>
                          <div className="flex items-center text-zinc-500 dark:text-zinc-400 text-sm mt-1.5">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            {service.salon.name}
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <div className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50">{service.price} ₼</div>
                          <div className="flex items-center text-zinc-500 dark:text-zinc-400 text-xs mt-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md font-medium">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            {service.duration} dəq
                          </div>
                        </div>
                     </Card>
                   ))}
                 </div>
               </div>
             )}

             {/* Matched Salons Section */}
             {matchedSalons.length > 0 && (
               <div>
                 <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4 tracking-tight">Tapılan Salonlar</h2>
                 <motion.div 
                   initial="hidden"
                   animate="visible"
                   variants={{
                     hidden: { opacity: 0 },
                     visible: {
                       opacity: 1,
                       transition: { staggerChildren: 0.1 }
                     }
                   }}
                   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                 >
                   {matchedSalons.map((salon: any) => (
                     <motion.div
                       key={salon.id}
                       variants={{
                         hidden: { opacity: 0, y: 20 },
                         visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
                       }}
                     >
                       <Card 
                         onClick={() => navigate(`/salons/${salon.id}`)}
                         className="flex flex-row p-3 rounded-2xl border-0 shadow-sm active:scale-[0.98] lg:hover:scale-[1.02] transition-transform cursor-pointer bg-white dark:bg-zinc-900 h-full"
                       >
                         <div className="w-24 h-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl flex-shrink-0 overflow-hidden relative">
                            <img 
                              src={salon.image_url ? `http://${window.location.hostname}${window.location.port === '5173' ? ':8000' : ''}${salon.image_url}` : DEFAULT_SALON_IMAGE} 
                              alt={salon.name} 
                              className="w-full h-full object-cover" 
                            />
                            {!salon.image_url && (
                              <div className="absolute top-1 left-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-zinc-800 dark:text-zinc-200">
                                Salon
                              </div>
                            )}
                         </div>
                         <div className="ml-4 flex flex-col justify-center flex-1">
                           <h3 className="font-bold text-zinc-900 dark:text-zinc-50 line-clamp-1">{salon.name}</h3>
                           <div className="flex items-center text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
                             <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                             <span className="line-clamp-1">{salon.address || 'Ünvan yoxdur'}</span>
                           </div>
                           <div className="flex items-center text-amber-500 font-medium text-sm mt-2">
                             <Star className="w-4 h-4 fill-current mr-1" />
                             {salon.average_rating ? salon.average_rating.toFixed(1) : '0.0'}
                           </div>
                         </div>
                       </Card>
                     </motion.div>
                   ))}
                 </motion.div>
               </div>
             )}
           </div>
        )}
      </div>
    </PageWrapper>
  );
}
