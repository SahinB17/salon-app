import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Loader2, Clock, DollarSign, Scissors, ChevronDown, Check } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../lib/api';

export default function ServicesManagement() {
  const queryClient = useQueryClient();
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editServiceId, setEditServiceId] = useState<number | null>(null);
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight transition-colors">Xidmətlər</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 transition-colors">Salonunuzdakı xidmətləri idarə edin</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center justify-between h-11 w-[200px] sm:w-[240px] px-4 rounded-xl border transition-all shadow-sm ${
                isSalonsLoading || salons.length === 0 
                  ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/80 text-white font-medium cursor-pointer'
              } text-sm`}
              disabled={isSalonsLoading || salons.length === 0}
            >
              <span className="truncate">
                {selectedSalonId ? `🏪 ${salons.find((s: any) => s.id === selectedSalonId)?.name || 'Salon Seçin'}` : 'Salon Seçin'}
              </span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && !isSalonsLoading && salons.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-full sm:w-[240px] z-50 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-xl shadow-2xl p-1">
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
          <div className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full transition-colors" />
          <div className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full transition-colors" />
        </div>
      ) : salons.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed transition-colors">
          Hələ heç bir salonunuz yoxdur. Əvvəlcə "Salonlarım" bölməsindən salon yaradın.
        </div>
      ) : !selectedSalonId ? (
        <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed transition-colors">
          Xidmətləri görmək üçün yuxarıdan salon seçin.
        </div>
      ) : isServicesLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full transition-colors" />
          <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full transition-colors" />
        </div>
      ) : services.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed transition-colors">
          Bu salon üçün hələ heç bir xidmət əlavə edilməyib.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service: any) => (
            <Card key={service.id} className="p-5 border-0 shadow-sm rounded-2xl flex flex-col group relative dark:bg-zinc-900 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center transition-colors">
                  <Scissors className="w-6 h-6" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEditService(service)}
                    className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteService(service.id)}
                    className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                    disabled={deleteServiceMutation.isPending}
                  >
                    {deleteServiceMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-1 transition-colors">{service.name}</h3>
              {service.description && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 flex-1 transition-colors">
                  {service.description}
                </p>
              )}
              <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between transition-colors">
                <div className="flex items-center text-sm font-medium text-zinc-900 dark:text-zinc-100 transition-colors">
                  <DollarSign className="w-4 h-4 text-zinc-400 dark:text-zinc-500 mr-1 transition-colors" />
                  {service.price} ₼
                </div>
                <div className="flex items-center text-sm font-medium text-zinc-500 dark:text-zinc-400 transition-colors">
                  <Clock className="w-4 h-4 text-zinc-400 dark:text-zinc-500 mr-1 transition-colors" />
                  {service.duration_minutes} dəq.
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-sm transition-colors">
          <Card className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] transition-colors border-0 dark:border dark:border-zinc-800">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 transition-colors">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 transition-colors">
                {editServiceId ? "Xidməti Redaktə et" : "Yeni Xidmət Yarat"}
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="service-form" onSubmit={handleSubmit} className="space-y-5">
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block transition-colors">Xidmətin Adı</label>
                  <Input required placeholder="Məs: Saç kəsimi" value={name} onChange={e => setName(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block transition-colors">Qiymət (₼)</label>
                    <Input required type="number" step="0.1" min="0" placeholder="25.00" value={price} onChange={e => setPrice(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block transition-colors">Müddət (dəq.)</label>
                    <Input required type="number" step="1" min="1" placeholder="45" value={duration} onChange={e => setDuration(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block transition-colors">Haqqında (İxtiyari)</label>
                  <textarea 
                    className="flex w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 px-3 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-none"
                    placeholder="Xidmət barədə əlavə məlumat..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end space-x-3 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-3xl transition-colors">
              <Button 
                type="button" 
                className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors" 
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
