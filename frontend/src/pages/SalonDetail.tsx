import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, MapPin, Star, Clock, Loader2, MessageSquare, Heart, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { toast } from 'sonner';
import { DEFAULT_SALON_IMAGE } from '../lib/constants';
import { Button } from '../components/ui/Button';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Input } from '../components/ui/Input';
import { PageWrapper } from '../components/ui/PageWrapper';
import { Map } from '../components/ui/Map';
import api from '../lib/api';

function generateTimeSlots(startHour = 9, endHour = 21) {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
}

function getImageUrl(path: string) {
  return `http://${window.location.hostname}${window.location.port === '5173' ? ':8000' : ''}${path}`;
}

interface BookingFormContentProps {
  selectedService: { id: number; name: string; price: number; duration_minutes: number };
  selectedStaff: number | null;
  setSelectedStaff: (id: number | null) => void;
  appointmentDate: string;
  setAppointmentDate: (date: string) => void;
  appointmentTime: string;
  setAppointmentTime: (time: string) => void;
  filteredStaffs: Array<{
    id: number;
    full_name: string;
    image_url?: string;
    rating?: number;
  }>;
  isSlotsLoading: boolean;
  isWorkingDay: boolean;
  staffWorkStart?: string;
  staffWorkEnd?: string;
  timeSlots: string[];
  isSlotBooked: (time: string) => boolean;
  isSlotPast: (time: string) => boolean;
  bookMutation: {
    isPending: boolean;
    isError: boolean;
    error: unknown;
    mutate: () => void;
  };
}

function BookingFormContent({
  selectedService,
  selectedStaff,
  setSelectedStaff,
  appointmentDate,
  setAppointmentDate,
  appointmentTime,
  setAppointmentTime,
  filteredStaffs,
  isSlotsLoading,
  isWorkingDay,
  staffWorkStart,
  staffWorkEnd,
  timeSlots,
  isSlotBooked,
  isSlotPast,
  bookMutation,
}: BookingFormContentProps) {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-50 dark:bg-[#161616] p-4 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800/60 transition-colors">
        <div className="font-bold text-zinc-900 dark:text-zinc-50">{selectedService.name}</div>
        <div className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          {selectedService.price} ₼ • {selectedService.duration_minutes} dəq.
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-zinc-900 dark:text-zinc-50 block mb-3">Usta seçin (İstəyə bağlı)</label>
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
          <div
            onClick={() => setSelectedStaff(null)}
            className={`flex flex-col items-center justify-center min-w-[76px] h-[92px] p-2 rounded-2xl border-2 transition-all cursor-pointer ${selectedStaff === null ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500' : 'border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-[#161616] hover:border-amber-500/30 text-zinc-800 dark:text-zinc-400'}`}
          >
            <div className="w-9 h-9 rounded-full mb-1 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">All</span>
            </div>
            <span className="text-xs font-semibold truncate w-full text-center px-0.5">Fərq etməz</span>
          </div>
          {filteredStaffs.map((staff) => (
            <div
              key={staff.id}
              onClick={() => setSelectedStaff(staff.id)}
              className={`flex flex-col items-center justify-center min-w-[76px] h-[92px] p-2 rounded-2xl border-2 transition-all cursor-pointer shrink-0 ${selectedStaff === staff.id ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500' : 'border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-[#161616] hover:border-amber-500/30 text-zinc-700 dark:text-zinc-400'}`}
            >
              <div className="w-9 h-9 rounded-full mb-1 overflow-hidden flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 shrink-0">
                {staff.image_url ? (
                  <img src={getImageUrl(staff.image_url)} alt={staff.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                    {staff.full_name ? staff.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : '?'}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold truncate w-full text-center px-0.5 mb-0.5">{staff.full_name?.split(' ')[0]}</span>
              <span className="flex items-center text-[10px] font-bold text-amber-500 dark:text-amber-400">
                <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
                {staff.rating !== undefined && staff.rating !== null ? staff.rating.toFixed(1) : '5.0'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-zinc-900 dark:text-zinc-50 block mb-2">Tarix</label>
        <Input
          type="date"
          value={appointmentDate}
          onChange={(e) => { setAppointmentDate(e.target.value); setAppointmentTime(''); }}
          min={new Date().toISOString().split('T')[0]}
          className="bg-white dark:bg-[#161616] border-zinc-200/80 dark:border-zinc-800/80 focus:border-amber-500/50 dark:focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all rounded-xl"
        />
      </div>

      {appointmentDate && (
        <div>
          <label className="text-sm font-bold text-zinc-900 dark:text-zinc-50 block mb-3">Saat seçin</label>
          {isSlotsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400 dark:text-zinc-500" />
            </div>
          ) : !isWorkingDay ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl text-center text-amber-700 dark:text-amber-500 text-sm transition-colors">
              Ustanın bu gün istirahət günüdür. Digər günləri seçin.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => {
                const booked = isSlotBooked(slot);
                const past = isSlotPast(slot);
                const outsideShift =
                  (staffWorkStart && slot < staffWorkStart) ||
                  (staffWorkEnd && slot >= staffWorkEnd);
                const disabled = Boolean(booked || past || outsideShift);
                const selected = appointmentTime === slot;

                return (
                  <button
                    key={slot}
                    onClick={() => !disabled && setAppointmentTime(slot)}
                    disabled={disabled}
                    className={`
                      py-2.5 rounded-xl text-sm font-medium transition-all
                      ${selected ? 'bg-amber-500 text-amber-950 ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-[#121212] font-bold shadow-lg shadow-amber-500/25' : ''}
                      ${disabled ? 'bg-red-50/50 dark:bg-red-500/5 text-red-300 dark:text-red-900/50 cursor-not-allowed line-through border border-red-100/50 dark:border-red-900/20' : ''}
                      ${!selected && !disabled ? 'bg-zinc-50 dark:bg-[#1a1a1a] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#222] border border-zinc-200/50 dark:border-zinc-800/60 cursor-pointer' : ''}
                    `}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200/50 dark:border-zinc-800/60" /> Boş</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-50/50 dark:bg-red-500/5 border border-red-100/50 dark:border-red-900/20" /> Dolu</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-500" /> Seçildi</div>
          </div>
        </div>
      )}

      {bookMutation.isError && (
        <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm transition-colors">
          {(bookMutation.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Rezervasiya zamanı xəta baş verdi. Saatları yoxlayın.'}
        </div>
      )}

      <Button
        className="w-full"
        onClick={() => bookMutation.mutate()}
        isLoading={bookMutation.isPending}
        disabled={!appointmentDate || !appointmentTime}
      >
        Təsdiqlə
      </Button>
    </div>
  );
}

export default function SalonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<{ id: number; name: string; price: number; duration_minutes: number } | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [emblaRef] = useEmblaCarousel({ loop: true });

  const { data: salon, isLoading } = useQuery({
    queryKey: ['salon', id],
    queryFn: async () => {
      const response = await api.get(`/api/v1/salons/${id}`);
      return response.data;
    }
  });

  useEffect(() => {
    if (salon) {
      const saved = localStorage.getItem('recentlyViewedSalons');
      let viewed = saved ? JSON.parse(saved) : [];
      viewed = viewed.filter((s: { id: number }) => s.id !== salon.id);
      viewed.unshift({
        id: salon.id,
        name: salon.name,
        image_url: salon.image_url
      });
      if (viewed.length > 5) viewed = viewed.slice(0, 5);
      localStorage.setItem('recentlyViewedSalons', JSON.stringify(viewed));
    }
  }, [salon]);

  const { data: reviews, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const response = await api.get(`/api/v1/reviews/salon/${id}`);
      return response.data;
    }
  });

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStaffId, setReviewStaffId] = useState<number | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const reviewMutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string; staff_id: number | null }) => {
      return api.post(`/api/v1/reviews/salon/${id}`, data);
    },
    onSuccess: () => {
      setIsReviewModalOpen(false);
      setReviewComment('');
      setReviewRating(5);
      setReviewStaffId(null);
      refetchReviews();
      queryClient.invalidateQueries({ queryKey: ['staff', id] });
      toast.success('Rəyiniz uğurla əlavə edildi!');
    },
    onError: () => {
      toast.error('Rəy əlavə edərkən xəta baş verdi.');
    }
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await api.get('/api/v1/favorites/me');
      return response.data;
    }
  });

  const isFavorite = favorites.some((fav: { salon_id: number }) => fav.salon_id === parseInt(id!));

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (isFav: boolean) => {
      if (isFav) {
        await api.delete(`/api/v1/favorites/${id}`);
        return { isFav: false };
      }
      await api.post(`/api/v1/favorites/${id}`);
      return { isFav: true };
    },
    onMutate: async (isFav) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previousFavorites = queryClient.getQueryData(['favorites']);

      queryClient.setQueryData(['favorites'], (old: Array<{ salon_id: number }> | undefined) => {
        if (isFav) {
          return old?.filter((fav) => fav.salon_id !== parseInt(id!)) || [];
        }
        return [...(old || []), { salon_id: parseInt(id!) }];
      });
      return { previousFavorites };
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(['favorites'], context?.previousFavorites);
      toast.error('Əməliyyat zamanı xəta baş verdi.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const { data: slotsData, isLoading: isSlotsLoading } = useQuery({
    queryKey: ['bookedSlots', id, appointmentDate, selectedStaff],
    queryFn: async () => {
      if (!appointmentDate) return null;
      const staffParam = selectedStaff ? `&staff_id=${selectedStaff}` : '';
      const res = await api.get(`/api/v1/appointments/salon/${id}/slots?date=${appointmentDate}${staffParam}`);
      return res.data;
    },
    enabled: !!appointmentDate && !!id
  });

  const bookedSlots = slotsData?.booked_slots || [];
  const staffWorkStart = slotsData?.work_start;
  const staffWorkEnd = slotsData?.work_end;
  const isWorkingDay = slotsData?.is_working_day ?? true;

  const bookMutation = useMutation({
    mutationFn: async () => {
      const localStart = new Date(`${appointmentDate}T${appointmentTime}:00`);
      const startDateTimeISO = localStart.toISOString();
      const durationMinutes = selectedService?.duration_minutes || 60;
      const localEnd = new Date(localStart.getTime() + durationMinutes * 60000);
      const endDateTimeISO = localEnd.toISOString();

      const response = await api.post('/api/v1/appointments/', {
        salon_id: parseInt(id!),
        service_id: selectedService!.id,
        staff_id: selectedStaff,
        start_time: startDateTimeISO,
        end_time: endDateTimeISO
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookedSlots', id, appointmentDate, selectedStaff] });
      setSelectedService(null);
      navigate('/appointments');
      toast.success('Rezervasiya uğurla tamamlandı!');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      queryClient.invalidateQueries({ queryKey: ['bookedSlots', id, appointmentDate, selectedStaff] });
      toast.error(error.response?.data?.detail || 'Rezervasiya zamanı xəta baş verdi.');
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-500">Yüklənir...</div>;
  }

  if (!salon) {
    return <div className="p-8 text-center text-red-500">Salon tapılmadı</div>;
  }

  const eligibleStaffs = salon.staffs?.filter((s: { is_active: boolean }) => s.is_active) || [];
  const hasAnyServiceLinks = eligibleStaffs.some((s: { services?: Array<{ id: number }> }) => s.services && s.services.length > 0);
  const filteredStaffs = hasAnyServiceLinks && selectedService
    ? eligibleStaffs.filter((s: { services?: Array<{ id: number }> }) => s.services?.some((srv) => srv.id === selectedService.id))
    : eligibleStaffs;

  const handleBookClick = (service: { id: number; name: string; price: number; duration_minutes: number }) => {
    setSelectedService(service);
    setSelectedStaff(null);
    setAppointmentDate('');
    setAppointmentTime('');
  };

  const isSlotBooked = (time: string): boolean => {
    if (!appointmentDate || bookedSlots.length === 0) return false;
    const slotStart = new Date(`${appointmentDate}T${time}:00`);
    const durationMinutes = selectedService?.duration_minutes || 60;
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

    return bookedSlots.some((booked: { start_time: string; end_time: string }) => {
      const bookedStart = new Date(booked.start_time);
      const bookedEnd = new Date(booked.end_time);
      return slotStart < bookedEnd && bookedStart < slotEnd;
    });
  };

  const isSlotPast = (time: string): boolean => {
    if (!appointmentDate) return false;
    const now = new Date();
    const slotDateTime = new Date(`${appointmentDate}T${time}:00`);
    return slotDateTime <= now;
  };

  const openHour = salon.open_time ? parseInt(salon.open_time.substring(0, 2)) : 9;
  const closeHour = salon.close_time ? parseInt(salon.close_time.substring(0, 2)) : 21;
  const timeSlots = generateTimeSlots(openHour, closeHour);

  const bookingFormProps = selectedService ? {
    selectedService,
    selectedStaff,
    setSelectedStaff,
    appointmentDate,
    setAppointmentDate,
    appointmentTime,
    setAppointmentTime,
    filteredStaffs,
    isSlotsLoading,
    isWorkingDay,
    staffWorkStart,
    staffWorkEnd,
    timeSlots,
    isSlotBooked,
    isSlotPast,
    bookMutation,
  } : null;

  return (
    <PageWrapper className="flex flex-col min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] pb-6 lg:pb-10 transition-colors">
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start lg:px-4 lg:pt-6">
        {/* Left column — gallery, info, services, reviews */}
        <div className="lg:col-span-8">
          <div className="relative h-64 lg:h-72 lg:max-h-[320px] bg-zinc-200 dark:bg-zinc-800 transition-colors lg:rounded-2xl lg:overflow-hidden">
            <div className="overflow-hidden h-full" ref={emblaRef}>
              <div className="flex h-full">
                {salon.image_url ? (
                  <div className="flex-[0_0_100%] min-w-0">
                    <img src={getImageUrl(salon.image_url)} alt={salon.name} className="w-full h-full object-cover" />
                  </div>
                ) : (!salon.images || salon.images.length === 0) && (
                  <div className="flex-[0_0_100%] min-w-0">
                    <img src={DEFAULT_SALON_IMAGE} alt={salon.name} className="w-full h-full object-cover" />
                  </div>
                )}
                {salon.images?.map((img: { id: number; image_url: string }) => (
                  <div key={img.id} className="flex-[0_0_100%] min-w-0">
                    <img src={getImageUrl(img.image_url)} alt={salon.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
            {/* Gradient overlay for premium transition to content */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white dark:from-[#0a0a0a] to-transparent pointer-events-none lg:hidden z-0"></div>
            <button
              onClick={() => navigate(-1)}
              className="absolute top-12 left-4 lg:top-4 w-10 h-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm z-10 active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 text-zinc-900 dark:text-zinc-50 pr-1" />
            </button>
            <button
              onClick={() => toggleFavoriteMutation.mutate(isFavorite)}
              className="absolute top-12 right-4 lg:top-4 w-10 h-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm z-10 active:scale-95 transition-transform"
            >
              <motion.div
                initial={false}
                animate={{ scale: isFavorite ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`}
                />
              </motion.div>
            </button>
          </div>

          <div className="px-5 pt-6 pb-4 bg-white dark:bg-[#121212] rounded-t-[2rem] -mt-8 lg:mt-4 lg:rounded-[1.5rem] relative z-10 shadow-sm border border-zinc-100 dark:border-zinc-800/60 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{salon.name}</h1>
                <div className="flex items-center text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>{salon.address || 'Ünvan yoxdur'}</span>
                </div>
                {salon.open_time && salon.close_time && (
                  <div className="flex items-center text-zinc-500 dark:text-zinc-400 mt-1.5 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{salon.open_time.substring(0, 5)} - {salon.close_time.substring(0, 5)}</span>
                  </div>
                )}
                {salon.contact_phone && (
                  <div className="flex items-center text-zinc-500 dark:text-zinc-400 mt-1.5 text-sm">
                    <Phone className="w-4 h-4 mr-1" />
                    <a href={`tel:${salon.contact_phone}`} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                      {salon.contact_phone}
                    </a>
                  </div>
                )}
              </div>
              <div className="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 px-2 py-1 rounded-lg flex items-center font-bold text-sm shrink-0">
                <Star className="w-3.5 h-3.5 fill-current mr-1" /> {salon.average_rating ? salon.average_rating.toFixed(1) : '0.0'}
              </div>
            </div>
          </div>

          {salon.images && salon.images.length > 0 && (
            <div className="px-4 mt-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Qalereya</h2>
              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                {salon.images.map((img: { id: number; image_url: string }) => (
                  <div
                    key={img.id}
                    className="w-40 h-40 flex-shrink-0 rounded-[1.25rem] overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800/60 cursor-pointer active:scale-95 transition-transform"
                    onClick={() => setSelectedImage(img.image_url)}
                  >
                    <img src={getImageUrl(img.image_url)} alt="Qalereya" className="w-full h-full object-cover pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-4 mt-6 lg:hidden">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Məkan</h2>
            <div className="w-full h-48 rounded-[1.5rem] overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800/60 bg-zinc-100 dark:bg-zinc-800 relative z-0">
              <Map salons={[salon]} className="w-full h-full z-0" />
            </div>
          </div>

          <div className="px-4 mt-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Xidmətlər</h2>
            <div className="space-y-3">
              {salon.services && salon.services.length > 0 ? (
                salon.services.map((service: { id: number; name: string; price: number; duration_minutes: number }) => (
                  <div
                    key={service.id}
                    className={`bg-white dark:bg-[#121212] p-4 rounded-[1.5rem] shadow-sm border flex justify-between items-center transition-colors ${
                      selectedService?.id === service.id
                        ? 'border-amber-500/50 ring-1 ring-amber-500/20 bg-amber-50/10'
                        : 'border-zinc-100 dark:border-zinc-800/60'
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{service.name}</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{service.price} ₼ • {service.duration_minutes} dəq.</p>
                    </div>
                    <Button
                      onClick={() => handleBookClick(service)}
                      className={`h-10 px-5 rounded-full transition-all ${selectedService?.id === service.id ? 'bg-amber-500 hover:bg-amber-600 text-amber-950' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                    >
                      Seç
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 dark:text-zinc-400 text-center py-4">Hələ xidmət əlavə edilməyib.</p>
              )}
            </div>
          </div>

          <div className="px-4 mt-8 pb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Rəylər ({reviews?.length || 0})</h2>
              <Button className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 h-8 px-3 text-xs rounded-full transition-colors" onClick={() => setIsReviewModalOpen(true)}>
                <MessageSquare className="w-3.5 h-3.5 mr-1" />
                Rəy yaz
              </Button>
            </div>
            <div className="space-y-4">
              {reviews && reviews.length > 0 ? (
                reviews.map((review: { id: number; rating: number; comment?: string; created_at: string; customer?: { full_name?: string } }) => (
                  <div key={review.id} className="bg-white dark:bg-[#121212] p-5 rounded-[1.5rem] shadow-sm border border-zinc-100 dark:border-zinc-800/60 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm text-zinc-900 dark:text-zinc-50">{review.customer?.full_name || 'İstifadəçi'}</div>
                      <div className="flex items-center text-amber-500 text-xs font-bold">
                        <Star className="w-3 h-3 fill-current mr-0.5" />
                        {review.rating}.0
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{review.comment}</p>
                    )}
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2">
                      {new Date(review.created_at).toLocaleDateString('az-AZ')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-zinc-50 dark:bg-[#161616] p-6 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800/60 text-center transition-colors">
                  <MessageSquare className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Hələ rəy yazılmayıb</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">İlk rəyi siz yazın!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column — sticky map + booking */}
        <aside className="hidden lg:flex lg:col-span-4 lg:flex-col lg:gap-5 lg:sticky lg:top-6 lg:self-start">
          <div className="bg-white dark:bg-[#121212] rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800/60 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Məkan</h2>
            </div>
            <div className="h-44 px-3 pb-3">
              <div className="w-full h-full rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800/60 bg-zinc-100 dark:bg-zinc-800">
                <Map salons={[salon]} className="w-full h-full z-0" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800/60 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Rezervasiya</h2>
              {selectedService && (
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                >
                  Ləğv et
                </button>
              )}
            </div>

            {bookingFormProps ? (
              <BookingFormContent {...bookingFormProps} />
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-5 h-5 text-zinc-400" />
                </div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Xidmət seçin</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  Sol tərəfdən xidmət seçərək rezervasiya edin
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile booking bottom sheet */}
      {selectedService && (
        <div className="lg:hidden">
          <BottomSheet
            isOpen={!!selectedService}
            onClose={() => setSelectedService(null)}
            title="Rezervasiya"
          >
            <BookingFormContent {...{
              selectedService,
              selectedStaff,
              setSelectedStaff,
              appointmentDate,
              setAppointmentDate,
              appointmentTime,
              setAppointmentTime,
              filteredStaffs,
              isSlotsLoading,
              isWorkingDay,
              staffWorkStart,
              staffWorkEnd,
              timeSlots,
              isSlotBooked,
              isSlotPast,
              bookMutation,
            }} />
          </BottomSheet>
        </div>
      )}

      <BottomSheet
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Rəy Bildir"
      >
        <div className="space-y-6">
          <div>
            <label className="text-sm font-bold text-zinc-900 dark:text-zinc-50 block mb-3 text-center">Qiymətləndirin</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-2 transition-transform active:scale-90"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${reviewRating >= star ? 'text-amber-500 fill-amber-500' : 'text-zinc-200 dark:text-zinc-800 fill-zinc-200 dark:fill-zinc-800'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {salon?.staffs && salon.staffs.length > 0 && (
            <div>
              <label className="text-sm font-bold text-zinc-900 dark:text-zinc-50 block mb-3">Xidmət edən usta (İstəyə bağlı)</label>
              <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
                <button
                  type="button"
                  onClick={() => setReviewStaffId(null)}
                  className={`flex flex-col items-center justify-center min-w-[64px] h-[72px] p-1.5 rounded-xl border-2 transition-all shrink-0 ${
                    reviewStaffId === null
                      ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
                      : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center mb-0.5">
                    <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400">Hamı</span>
                  </div>
                  <span className="text-[10px] font-semibold">Fərq etməz</span>
                </button>
                {salon.staffs.filter((s: { is_active: boolean }) => s.is_active).map((staff: { id: number; full_name: string; image_url?: string }) => (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => setReviewStaffId(staff.id === reviewStaffId ? null : staff.id)}
                    className={`flex flex-col items-center justify-center min-w-[64px] h-[72px] p-1.5 rounded-xl border-2 transition-all shrink-0 ${
                      reviewStaffId === staff.id
                        ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                        : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full mb-0.5 overflow-hidden flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 shrink-0">
                      {staff.image_url ? (
                        <img src={getImageUrl(staff.image_url)} alt={staff.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                          {staff.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold truncate w-full text-center px-0.5">
                      {staff.full_name?.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-bold text-zinc-900 dark:text-zinc-50 block mb-2">Fikriniz (İstəyə bağlı)</label>
            <textarea
              className="w-full bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800/60 text-zinc-900 dark:text-zinc-100 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 resize-none h-24 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-all"
              placeholder="Salon və ya usta haqqında təəssüratlarınızı bölüşün..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={() => reviewMutation.mutate({ rating: reviewRating, comment: reviewComment, staff_id: reviewStaffId })}
            isLoading={reviewMutation.isPending}
          >
            Göndər
          </Button>
        </div>
      </BottomSheet>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col backdrop-blur-sm"
          >
            <div className="p-4 flex justify-end">
              <button
                onClick={() => setSelectedImage(null)}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="flex-1 p-4 flex items-center justify-center overflow-hidden"
              onClick={() => setSelectedImage(null)}
            >
              <img
                src={getImageUrl(selectedImage)}
                alt="Fullscreen"
                className="max-w-full max-h-full object-contain rounded-xl"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
