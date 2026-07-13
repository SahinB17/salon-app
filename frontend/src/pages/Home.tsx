import { Search, MapPin, Star, Calendar, Navigation, Settings2, Heart } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { PageWrapper } from '../components/ui/PageWrapper';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { BottomSheet } from '../components/ui/BottomSheet';
import { DEFAULT_SALON_IMAGE } from '../lib/constants';
import { toast } from 'sonner';
import api from '../lib/api';

import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return [];
      const response = await api.get('/api/v1/favorites/me');
      return response.data;
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ salonId, isFav }: { salonId: number; isFav: boolean }) => {
      if (isFav) {
        await api.delete(`/api/v1/favorites/${salonId}`);
        return { salonId, isFav: false };
      }
      await api.post(`/api/v1/favorites/${salonId}`);
      return { salonId, isFav: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: () => {
      toast.error('Əməliyyat zamanı xəta baş verdi. Daxil olduğunuza əmin olun.');
    }
  });

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

  const { data: appointments = [] } = useQuery({
    queryKey: ['myAppointments'],
    queryFn: async () => {
      const response = await api.get('/api/v1/appointments/me');
      return response.data;
    },
    enabled: !!localStorage.getItem('token')
  });

  const upcomingAppointment = appointments
    .filter((apt: any) => {
      if (apt.status === 'cancelled' || apt.status === 'completed') return false;
      const aptDate = new Date(apt.start_time);
      const now = new Date();
      const end = new Date(apt.end_time);
      return aptDate.getTime() <= now.getTime() + 36 * 60 * 60 * 1000 && end.getTime() >= now.getTime();
    })
    .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0];

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
    <PageWrapper className="flex flex-col min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] font-sans pb-6 transition-colors">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-b-[2.5rem] lg:rounded-3xl lg:mt-6 lg:mx-6 bg-white dark:bg-[#121212] px-6 pt-16 lg:pt-14 pb-12 text-zinc-900 dark:text-white border-b lg:border border-zinc-100 dark:border-zinc-800/60 transition-all flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 shadow-sm">
          {/* Background Glows */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute right-1/4 top-0 -mr-16 -mt-16 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[100px]"></div>
            <div className="absolute left-0 bottom-0 -mb-20 w-64 h-64 rounded-full bg-amber-600/5 blur-[80px]"></div>
          </div>
          
          <div className="relative z-10 max-w-2xl flex-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-amber-700 dark:text-amber-500 mb-4">
              XOŞ GƏLMİSİNİZ
            </span>
            <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
              {displayGreeting}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-md">
              Bu gün özünüzə vaxt ayırın və ən yaxşı salonları kəşf edin.
            </p>
            
            <button 
              onClick={() => setIsHowItWorksOpen(true)}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-200 dark:border-amber-900/40 text-zinc-700 dark:text-amber-500 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-amber-500/10 transition-colors"
            >
              <Navigation className="w-4 h-4" /> Necə işləyir?
            </button>
          </div>

          {/* Upcoming Appointment Integrated into Hero */}
          {upcomingAppointment && (
            <div className="relative z-10 w-full lg:w-[400px] shrink-0">
              <div className="relative overflow-hidden rounded-2xl bg-[#1a1a1a]/80 backdrop-blur-md border border-amber-900/30 p-5 text-white shadow-xl">
                <div className="absolute right-0 top-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl"></div>
                
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                        YAXINLAŞAN RANDEVU
                      </span>
                      <h3 className="font-bold text-lg mt-0.5 text-zinc-50">
                        {upcomingAppointment.salon?.name || 'Salon'}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 font-medium">
                        Saat: {new Date(upcomingAppointment.start_time).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })} • {new Date(upcomingAppointment.start_time).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      const lat = upcomingAppointment.salon?.latitude;
                      const lng = upcomingAppointment.salon?.longitude;
                      const addr = upcomingAppointment.salon?.address;
                      if (lat && lng) {
                        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
                      } else if (addr) {
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`, '_blank');
                      } else {
                        toast.error("Məkan məlumatı tapılmadı");
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 font-bold text-xs px-4 py-2.5 rounded-xl transition-all w-full"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Yerini dəyiş (Xəritədə bax)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Visual Search Box */}
        <div className="relative -mt-7 z-20 mx-4 lg:max-w-2xl lg:mx-auto">
          <div 
            onClick={() => navigate('/salons')}
            className="flex items-center bg-white dark:bg-[#161616] border border-zinc-200/80 dark:border-zinc-800/80 rounded-full px-6 py-4 shadow-lg cursor-pointer active:scale-[0.98] transition-transform"
          >
            <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mr-3 shrink-0" />
            <span className="text-zinc-500 dark:text-zinc-400 font-medium flex-1 text-sm">Salon və xidmət axtarın...</span>
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-500">
              <Settings2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Quick Search Services */}
        <div className="mt-8 mx-4 lg:max-w-4xl lg:mx-auto">
          <div className="flex overflow-x-auto lg:flex-wrap lg:justify-center gap-3 pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
            {[
              { name: 'Kişi saç kəsimi', icon: '✂️' },
              { name: 'Qadın saç kəsimi', icon: '💇‍♀️' },
              { name: 'Manikür', icon: '💅' },
              { name: 'Makiyaj', icon: '💄' },
              { name: 'Masaj', icon: '💆‍♂️' },
              { name: 'Lazer epilyasiyası', icon: '✨' },
            ].map((srv) => (
              <button
                key={srv.name}
                onClick={() => navigate(`/salons?q=${encodeURIComponent(srv.name)}`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap transition-colors active:scale-95"
              >
                <span className="text-amber-600 dark:text-amber-500">{srv.icon}</span>
                <span>{srv.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="px-4 lg:px-6 mt-8 lg:max-w-6xl lg:mx-auto">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Son Baxılanlar</h2>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
              {recentlyViewed.map((salon: any) => (
                <div 
                  key={salon.id} 
                  onClick={() => navigate(`/salons/${salon.id}`)}
                  className="w-[160px] lg:w-[220px] min-w-[160px] lg:min-w-[220px] shrink-0 h-32 lg:h-40 relative group snap-center rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform cursor-pointer"
                >
                  <img 
                    src={salon.image_url ? `${window.location.protocol}//${window.location.hostname}${window.location.port === '5173' ? ':8000' : ''}${salon.image_url}` : DEFAULT_SALON_IMAGE} 
                    alt={salon.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-white text-sm truncate">{salon.name}</h3>
                    <div className="flex items-center text-amber-400 text-[10px] font-bold mt-1">
                      <Star className="w-3 h-3 fill-current mr-0.5" />
                      {salon.average_rating ? salon.average_rating.toFixed(1) : '0.0'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="px-4 lg:px-6 mt-8 lg:max-w-6xl lg:mx-auto">
            <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Məşhur Salonlar</h2>
            <span className="text-sm font-medium text-amber-600 dark:text-amber-500 cursor-pointer hover:text-amber-700 dark:hover:text-amber-400 transition-colors" onClick={() => navigate('/salons')}>
              Hamısına bax &rarr;
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
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
          >
            {isLoading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
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
                <div 
                  onClick={() => navigate(`/salons/${salon.id}`)}
                  className="group w-full h-48 lg:h-64 relative rounded-[2rem] overflow-hidden shadow-sm active:scale-[0.98] lg:hover:scale-[1.02] transition-transform cursor-pointer bg-[#0a0a0a]"
                  style={{ transform: 'translateZ(0)' }}
                >
                  <img 
                    src={salon.image_url ? `${window.location.protocol}//${window.location.hostname}${window.location.port === '5173' ? ':8000' : ''}${salon.image_url}` : DEFAULT_SALON_IMAGE} 
                    alt={salon.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
                  
                  {/* Heart Icon Top Right */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      const token = localStorage.getItem('token');
                      if (!token) {
                        window.dispatchEvent(new CustomEvent('open-login-modal'));
                        return;
                      }
                      const isFav = favorites.some((fav: any) => fav.salon_id === salon.id);
                      toggleFavoriteMutation.mutate({ salonId: salon.id, isFav });
                    }}
                    title={!localStorage.getItem('token') ? "Favoritlərə əlavə etmək üçün daxil olun" : ""}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white hover:bg-white/20 transition-colors"
                  >
                     <Heart className={`w-4 h-4 transition-colors ${favorites.some((fav: any) => fav.salon_id === salon.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </div>

                  {/* Content Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
                    <div className="grid grid-cols-[1fr_auto] items-end gap-4 w-full">
                      <div className="min-w-0 pr-2">
                        <h3 className="font-bold text-white text-lg lg:text-xl truncate">{salon.name}</h3>
                        <div className="flex items-center text-zinc-300 mt-2 text-xs lg:text-sm">
                          <MapPin className="w-3.5 h-3.5 mr-1" />
                          <span className="truncate">{salon.address || 'Ünvan yoxdur'}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center bg-amber-500/20 backdrop-blur-md px-2 py-1 rounded-lg border border-amber-500/30 text-amber-400 font-bold text-xs">
                          <Star className="w-3.5 h-3.5 fill-current mr-1" />
                          {salon.average_rating ? salon.average_rating.toFixed(1) : '0.0'}
                        </div>
                        <button className="bg-amber-500 text-amber-950 px-5 py-2 rounded-xl text-xs font-bold hover:bg-amber-400 transition-colors">
                          Bax
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
          </motion.div>
        </div>

        {/* How It Works Modal / BottomSheet */}
        <BottomSheet isOpen={isHowItWorksOpen} onClose={() => setIsHowItWorksOpen(false)} title="SalonApp necə işləyir?">
          <div className="space-y-6 pt-2">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-inner">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">1. Salon tapın</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Sizə ən yaxın və ya ən uyğun salonu axtarıb tapın, qiymətləndirmələrini oxuyun.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-inner">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">2. Vaxt seçin</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Özünüzə uyğun xidməti, usta və saatı seçib asanlıqla rezervasiya edin.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-inner">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">3. Həzz alın</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Vaxtında yaxınlaşın, xidmətdən yararlanın və təcrübənizi digərləriylə bölüşün.</p>
              </div>
            </div>

            <button 
              onClick={() => setIsHowItWorksOpen(false)}
              className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold py-3.5 rounded-xl transition-colors active:scale-[0.98]"
            >
              Aydındır, davam edək
            </button>
          </div>
        </BottomSheet>
    </PageWrapper>
  );
}
