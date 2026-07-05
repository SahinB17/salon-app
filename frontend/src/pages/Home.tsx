import { Search, MapPin, Star, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { PageWrapper } from '../components/ui/PageWrapper';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import api from '../lib/api';

import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentlyViewedSalons');
    if (saved) {
      setRecentlyViewed(JSON.parse(saved));
    }
  }, []);

  const { data: popularSalons = [], isLoading } = useQuery({
    queryKey: ['salons'],
    queryFn: async () => {
      const response = await api.get('/api/v1/salons/');
      return response.data;
    }
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const response = await api.get('/api/v1/users/me');
      return response.data;
    },
    enabled: !!localStorage.getItem('token')
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Sabahın xeyir';
    if (hour >= 12 && hour < 18) return 'Hər vaxtınız xeyir';
    return 'Axşamın xeyir';
  };
  
  const greeting = getGreeting();
  const userName = user?.full_name?.split(' ')[0] || user?.username || '';
  const displayGreeting = userName ? `${greeting}, ${userName}!` : 'Salam! 👋';

  return (
    <PageWrapper className="flex flex-col min-h-screen bg-zinc-50 dark:bg-[#121212] font-sans pb-6 transition-colors">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header / Greeting */}
        <div className="relative overflow-hidden rounded-b-[2.5rem] bg-white dark:bg-zinc-950 px-6 pt-16 pb-8 text-zinc-900 dark:text-white shadow-sm dark:shadow-lg border-b border-zinc-100 dark:border-zinc-900 transition-all">
          <div className="absolute inset-0 overflow-hidden rounded-b-[2.5rem] pointer-events-none">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-amber-500/5 dark:bg-amber-500/15 blur-3xl"></div>
            <div className="absolute left-1/3 bottom-0 -mb-20 w-64 h-64 rounded-full bg-rose-500/5 dark:bg-rose-500/10 blur-3xl"></div>
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20 mb-3">
              ✨ Xoş gəlmisiniz
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-650 dark:from-white dark:via-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
              {displayGreeting}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
              Bu gün özünüzə vaxt ayırın və ən yaxşı xidmətləri sifariş edin
            </p>
          </div>
        </div>
        
        {/* Visual Search Box (Touch Target) */}
        <div 
          onClick={() => navigate('/salons')}
          className="mt-6 mx-4 flex items-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-sm cursor-pointer active:scale-[0.98] transition-all h-14"
        >
          <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mr-3" />
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">Salon və ya xidmət axtar...</span>
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="px-4 mt-8">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Son Baxılanlar</h2>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-4 px-4 scrollbar-hide">
              {recentlyViewed.map((salon: any) => (
                <div 
                  key={salon.id} 
                  onClick={() => navigate(`/salons/${salon.id}`)}
                  className="min-w-[140px] snap-center bg-white dark:bg-zinc-900 rounded-2xl p-2 shadow-sm border border-zinc-100 dark:border-zinc-800 active:scale-95 transition-transform cursor-pointer"
                >
                  <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl overflow-hidden mb-2">
                     {salon.image_url ? (
                       <img src={`http://${window.location.hostname}${window.location.port === '5173' ? ':8000' : ''}${salon.image_url}`} alt={salon.name} className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                         <MapPin className="w-6 h-6" />
                       </div>
                     )}
                  </div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm truncate px-1">{salon.name}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="px-4 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Məşhur Salonlar</h2>
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors" onClick={() => navigate('/salons')}>
              Hamısı
            </span>
          </div>
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="space-y-4"
          >
            {isLoading ? (
              // Loading skeleton
              [1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))
            ) : (
            popularSalons.map((salon: any) => (
              <motion.div
                key={salon.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
                }}
              >
                <Card 
                  onClick={() => navigate(`/salons/${salon.id}`)}
                  className="w-full snap-center rounded-2xl overflow-hidden border-0 shadow-sm active:scale-[0.98] lg:hover:scale-[1.02] transition-transform cursor-pointer dark:bg-zinc-900"
                >
                  <div className="h-32 bg-zinc-200 dark:bg-zinc-800 w-full relative">
                     {salon.image_url ? (
                       <img src={`http://${window.location.hostname}${window.location.port === '5173' ? ':8000' : ''}${salon.image_url}`} alt={salon.name} className="w-full h-full object-cover" />
                     ) : (
                       <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-zinc-800 dark:text-zinc-200">
                         Salon
                       </div>
                     )}
                  </div>
                  <div className="p-4 bg-white dark:bg-zinc-900">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-50 truncate">{salon.name}</h3>
                    <div className="flex items-center text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      <span className="truncate">{salon.address || 'Ünvan yoxdur'}</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center text-amber-500 font-medium text-sm">
                        <Star className="w-4 h-4 fill-current mr-1" />
                        {salon.average_rating ? salon.average_rating.toFixed(1) : '0.0'}
                      </div>
                      <div className="flex items-center text-zinc-400 dark:text-zinc-500 text-xs font-medium">
                         <Clock className="w-3.5 h-3.5 mr-1" /> Bax
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
          </motion.div>
        </div>


      </div>
    </PageWrapper>
  );
}
