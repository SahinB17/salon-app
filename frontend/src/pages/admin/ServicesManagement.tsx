import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Loader2, Clock, DollarSign, Scissors } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../lib/api';

export default function ServicesManagement() {
  const queryClient = useQueryClient();
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editServiceId, setEditServiceId] = useState<number | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');

  // Get user to know owner_id
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await api.get('/api/v1/users/me');
      return res.data;
    }
  });

  // Fetch admin's salons for the dropdown
  const { data: salons = [], isLoading: isSalonsLoading } = useQuery({
    queryKey: ['adminSalons'],
    queryFn: async () => {
      const res = await api.get('/api/v1/salons/');
      const mySalons = res.data.filter((s: any) => s.owner_id === user?.id);
      
      // Select the first salon by default if none selected
      if (mySalons.length > 0 && !selectedSalonId) {
        setSelectedSalonId(mySalons[0].id);
      }
      return mySalons;
    },
    enabled: !!user?.id
  });

  // Fetch services for the selected salon
  const { data: services = [], isLoading: isServicesLoading } = useQuery({
    queryKey: ['services', selectedSalonId],
    queryFn: async () => {
      if (!selectedSalonId) return [];
      const res = await api.get(`/api/v1/services/salon/${selectedSalonId}`);
      return res.data;
    },
    enabled: !!selectedSalonId
  });

  // Mutations
  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      const res = await api.post('/api/v1/services/', serviceData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', selectedSalonId] });
      resetForm();
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: async (data: { id: number; serviceData: any }) => {
      const res = await api.put(`/api/v1/services/${data.id}`, data.serviceData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', selectedSalonId] });
      resetForm();
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/api/v1/services/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', selectedSalonId] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalonId) return;

    const serviceData = {
      name,
      description,
      price: parseFloat(price),
      duration_minutes: parseInt(duration, 10),
      salon_id: selectedSalonId
    };

    if (editServiceId) {
      updateServiceMutation.mutate({ id: editServiceId, serviceData });
    } else {
      createServiceMutation.mutate(serviceData);
    }
  };

  const handleEditService = (service: any) => {
    setEditServiceId(service.id);
    setName(service.name);
    setDescription(service.description || '');
    setPrice(service.price.toString());
    setDuration(service.duration_minutes.toString());
    setIsModalOpen(true);
  };

  const handleDeleteService = (id: number) => {
    if (window.confirm("Bu xidməti silmək istədiyinizə əminsiniz?")) {
      deleteServiceMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setDuration('');
    setEditServiceId(null);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Xidmətlər</h1>
          <p className="text-zinc-500 mt-1">Salonunuzdakı xidmətləri idarə edin</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            className="h-11 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 min-w-[200px]"
            value={selectedSalonId || ''}
            onChange={(e) => setSelectedSalonId(Number(e.target.value))}
            disabled={isSalonsLoading || salons.length === 0}
          >
            <option value="" disabled>Salon seçin</option>
            {salons.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="rounded-xl px-5 h-11"
            disabled={!selectedSalonId}
          >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Xidmət
          </Button>
        </div>
      </div>

      {isSalonsLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-zinc-200 rounded-2xl w-full" />
          <div className="h-20 bg-zinc-200 rounded-2xl w-full" />
        </div>
      ) : salons.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 bg-zinc-50 rounded-2xl border border-zinc-200 border-dashed">
          Hələ heç bir salonunuz yoxdur. Əvvəlcə "Salonlarım" bölməsindən salon yaradın.
        </div>
      ) : !selectedSalonId ? (
        <div className="py-12 text-center text-zinc-500 bg-zinc-50 rounded-2xl border border-zinc-200 border-dashed">
          Xidmətləri görmək üçün yuxarıdan salon seçin.
        </div>
      ) : isServicesLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-zinc-200 rounded-2xl w-full" />
          <div className="h-24 bg-zinc-200 rounded-2xl w-full" />
        </div>
      ) : services.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 bg-zinc-50 rounded-2xl border border-zinc-200 border-dashed">
          Bu salon üçün hələ heç bir xidmət əlavə edilməyib.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service: any) => (
            <Card key={service.id} className="p-5 border-0 shadow-sm rounded-2xl flex flex-col group relative">
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Scissors className="w-6 h-6" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEditService(service)}
                    className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center hover:bg-zinc-200 hover:text-zinc-900 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteService(service.id)}
                    className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
                    disabled={deleteServiceMutation.isPending}
                  >
                    {deleteServiceMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">{service.name}</h3>
              {service.description && (
                <p className="text-sm text-zinc-500 line-clamp-2 mb-4 flex-1">
                  {service.description}
                </p>
              )}
              <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center text-sm font-medium text-zinc-900">
                  <DollarSign className="w-4 h-4 text-zinc-400 mr-1" />
                  {service.price} ₼
                </div>
                <div className="flex items-center text-sm font-medium text-zinc-500">
                  <Clock className="w-4 h-4 text-zinc-400 mr-1" />
                  {service.duration_minutes} dəq.
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-900">
                {editServiceId ? "Xidməti Redaktə et" : "Yeni Xidmət Yarat"}
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="service-form" onSubmit={handleSubmit} className="space-y-5">
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 block">Xidmətin Adı</label>
                  <Input required placeholder="Məs: Saç kəsimi" value={name} onChange={e => setName(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 block">Qiymət (₼)</label>
                    <Input required type="number" step="0.1" min="0" placeholder="25.00" value={price} onChange={e => setPrice(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 block">Müddət (dəq.)</label>
                    <Input required type="number" step="1" min="1" placeholder="45" value={duration} onChange={e => setDuration(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 block">Haqqında (İxtiyari)</label>
                  <textarea 
                    className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-none"
                    placeholder="Xidmət barədə əlavə məlumat..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-zinc-100 flex justify-end space-x-3 bg-zinc-50/50 rounded-b-3xl">
              <Button 
                type="button" 
                className="bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50" 
                onClick={resetForm} 
                disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
              >
                Ləğv et
              </Button>
              <Button type="submit" form="service-form" disabled={createServiceMutation.isPending || updateServiceMutation.isPending}>
                {(createServiceMutation.isPending || updateServiceMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editServiceId ? "Yadda Saxla" : "Yarat"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
