import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronLeft, MapPin, Star, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Input } from '../components/ui/Input';
import api from '../lib/api';

export default function SalonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  const { data: salon, isLoading } = useQuery({
    queryKey: ['salon', id],
    queryFn: async () => {
      const response = await api.get(`/api/v1/salons/${id}`);
      return response.data;
    }
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const startDateTime = `${appointmentDate}T${appointmentTime}:00`;
      // Calculate end time (assuming 1 hour for now, can be based on service duration)
      const d = new Date(startDateTime);
      d.setHours(d.getHours() + 1);
      const endDateTime = d.toISOString().substring(0, 19);

      const response = await api.post('/api/v1/appointments/', {
        salon_id: parseInt(id!),
        service_id: selectedService.id,
        staff_id: selectedStaff,
        start_time: startDateTime,
        end_time: endDateTime
      });
      return response.data;
    },
    onSuccess: () => {
      setSelectedService(null);
      navigate('/appointments');
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-500">Yüklənir...</div>;
  }

  if (!salon) {
    return <div className="p-8 text-center text-red-500">Salon tapılmadı</div>;
  }

  const handleBookClick = (service: any) => {
    setSelectedService(service);
    setSelectedStaff(null);
    setAppointmentDate('');
    setAppointmentTime('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] pb-6">
      {/* Top Header Image & Back Button */}
      <div className="relative h-64 bg-zinc-200">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm z-10 active:scale-95"
        >
          <ChevronLeft className="w-6 h-6 text-zinc-900 pr-1" />
        </button>
      </div>

      {/* Info Section */}
      <div className="px-5 pt-6 pb-4 bg-white rounded-t-3xl -mt-6 relative z-10 shadow-sm border-b border-zinc-100">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{salon.name}</h1>
            <div className="flex items-center text-zinc-500 mt-2 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{salon.address || 'Ünvan yoxdur'}</span>
            </div>
            {salon.open_time && salon.close_time && (
              <div className="flex items-center text-zinc-500 mt-1.5 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                <span>{salon.open_time.substring(0,5)} - {salon.close_time.substring(0,5)}</span>
              </div>
            )}
          </div>
          <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg flex items-center font-bold text-sm">
            <Star className="w-3.5 h-3.5 fill-current mr-1" /> 5.0
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">Xidmətlər</h2>
        <div className="space-y-3">
          {salon.services && salon.services.length > 0 ? (
            salon.services.map((service: any) => (
              <div key={service.id} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-zinc-900">{service.name}</h3>
                  <p className="text-sm text-zinc-500 mt-1">{service.price} ₼ • 1 saat</p>
                </div>
                <Button 
                  onClick={() => handleBookClick(service)}
                  className="h-10 px-5 rounded-full"
                >
                  Seç
                </Button>
              </div>
            ))
          ) : (
            <p className="text-zinc-500 text-center py-4">Hələ xidmət əlavə edilməyib.</p>
          )}
        </div>
      </div>

      {/* Booking Bottom Sheet */}
      <BottomSheet 
        isOpen={!!selectedService} 
        onClose={() => setSelectedService(null)}
        title="Rezervasiya"
      >
        {selectedService && (
          <div className="space-y-6">
            <div className="bg-zinc-50 p-4 rounded-xl">
              <div className="font-bold text-zinc-900">{selectedService.name}</div>
              <div className="text-zinc-500 text-sm mt-1">{selectedService.price} ₼</div>
            </div>

            {/* Staff Selection (Optional) */}
            <div>
              <label className="text-sm font-bold text-zinc-900 block mb-3">Usta seçin (İstəyə bağlı)</label>
              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                <div 
                  onClick={() => setSelectedStaff(null)}
                  className={`flex flex-col items-center justify-center min-w-[72px] h-[72px] rounded-2xl border-2 transition-all cursor-pointer ${selectedStaff === null ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 bg-white'}`}
                >
                  <span className="text-xs font-semibold text-zinc-800">Fərq etməz</span>
                </div>
                {salon.staffs && salon.staffs.filter((s: any) => s.is_active).map((staff: any) => (
                  <div 
                    key={staff.id}
                    onClick={() => setSelectedStaff(staff.id)}
                    className={`flex flex-col items-center justify-center min-w-[72px] h-[72px] rounded-2xl border-2 transition-all cursor-pointer ${selectedStaff === staff.id ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 bg-white'}`}
                  >
                     <div className="w-8 h-8 bg-zinc-200 rounded-full mb-1"></div>
                     <span className="text-xs font-medium text-zinc-700 truncate w-full text-center px-1">{staff.first_name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Date and Time */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-zinc-900 block mb-2">Tarix</label>
                <Input 
                  type="date" 
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-zinc-900 block mb-2">Saat</label>
                <Input 
                  type="time" 
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                />
              </div>
            </div>

            {bookMutation.isError && (
               <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                 {(bookMutation.error as any).response?.data?.detail || "Rezervasiya zamanı xəta baş verdi. Saatları yoxlayın."}
               </div>
            )}

            <Button 
              className="w-full mt-4" 
              onClick={() => bookMutation.mutate()}
              isLoading={bookMutation.isPending}
              disabled={!appointmentDate || !appointmentTime}
            >
              Təsdiqlə
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
