import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { DEFAULT_SALON_IMAGE } from '../lib/constants';
import { MapPin, Star, Heart } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { PageWrapper } from '../components/ui/PageWrapper';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import api from '../lib/api';
import { motion } from 'framer-motion';

export default function Favorites() {
  const navigate = useNavigate();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await api.get('/api/v1/favorites/me');
      return response.data;
    }
  });

  return (
    <PageWrapper className="flex flex-col min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] pb-24 lg:pb-8 transition-colors">
      <div className="px-4 pt-12 lg:pt-16">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6 transition-colors tracking-tight">Seçilmiş Salonlarım</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <EmptyState 
            icon={Heart}
            title="Siyahı boşdur"
            description="Hələ heç bir salonu seçilmişlərə əlavə etməmisiniz."
            buttonText="Kəşf etməyə başla"
            buttonLink="/salons"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((fav: any) => {
              const salon = fav.salon;
              if (!salon) return null;
              return (
                <motion.div 
                  key={fav.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card 
                    onClick={() => navigate(`/salons/${salon.id}`)}
                    className="flex flex-row p-3 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800/60 shadow-sm active:scale-[0.98] lg:hover:scale-[1.02] transition-transform cursor-pointer bg-white dark:bg-[#121212] relative group"
                  >
                    <div className="absolute top-3 right-3 z-10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md p-1.5 rounded-full border border-zinc-200/50 dark:border-zinc-700/50">
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </div>
                    <div className="w-24 h-24 bg-zinc-200 dark:bg-zinc-900 rounded-[1.25rem] flex-shrink-0 overflow-hidden relative border border-zinc-100 dark:border-zinc-800/50">
                      <img 
                        src={salon.image_url ? `http://${window.location.hostname}${window.location.port === '5173' ? ':8000' : ''}${salon.image_url}` : DEFAULT_SALON_IMAGE} 
                        alt={salon.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      {!salon.image_url && (
                        <div className="absolute top-1 left-1 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[10px] font-bold text-zinc-800 dark:text-zinc-200">
                          Salon
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col justify-center flex-1 pr-6">
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-50 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">{salon.name}</h3>
                      <div className="flex items-center text-zinc-500 dark:text-zinc-400 mt-1.5 text-sm">
                        <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-amber-500" />
                        <span className="line-clamp-1">{salon.address || 'Ünvan yoxdur'}</span>
                      </div>
                      <div className="flex items-center text-amber-600 dark:text-amber-500 font-bold text-sm mt-2 bg-amber-50 dark:bg-amber-500/10 w-max px-2 py-0.5 rounded-md">
                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                        {salon.average_rating ? salon.average_rating.toFixed(1) : '0.0'}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
