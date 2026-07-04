import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Image as ImageIcon, MapPin, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../lib/api';

export default function SalonsManagement() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSalonId, setEditSalonId] = useState<number | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Get user to know owner_id
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await api.get('/api/v1/users/me');
      return res.data;
    }
  });

  // Fetch admin's salons
  const { data: salons = [], isLoading } = useQuery({
    queryKey: ['adminSalons'],
    queryFn: async () => {
      // In a real app, you might have an endpoint like /api/v1/salons/me 
      // or filter the salons by owner_id. We'll fetch all and filter for now.
      const res = await api.get('/api/v1/salons/');
      return res.data.filter((s: any) => s.owner_id === user?.id);
    },
    enabled: !!user?.id
  });

  const createSalonMutation = useMutation({
    mutationFn: async (salonData: any) => {
      const res = await api.post('/api/v1/salons/', salonData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSalons'] });
      resetForm();
    }
  });

  const updateSalonMutation = useMutation({
    mutationFn: async (data: { id: number; salonData: any }) => {
      const res = await api.put(`/api/v1/salons/${data.id}`, data.salonData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSalons'] });
      resetForm();
    }
  });

  const deleteSalonMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/api/v1/salons/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSalons'] });
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let uploadedImageUrl = null;

    if (imageFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await api.post('/api/v1/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedImageUrl = uploadRes.data.image_url;
      } catch (error) {
        console.error("Şəkil yüklənərkən xəta baş verdi:", error);
      } finally {
        setIsUploading(false);
      }
    }

    const salonData = {
      name,
      address,
      contact_phone: phone,
      description,
      owner_id: user.id,
      ...(uploadedImageUrl ? { image_url: uploadedImageUrl } : {})
    };

    if (editSalonId) {
      updateSalonMutation.mutate({ id: editSalonId, salonData });
    } else {
      createSalonMutation.mutate({ ...salonData, image_url: uploadedImageUrl });
    }
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setPhone('');
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
    setEditSalonId(null);
    setIsModalOpen(false);
  };

  const handleEditSalon = (salon: any) => {
    setEditSalonId(salon.id);
    setName(salon.name);
    setAddress(salon.address);
    setPhone(salon.contact_phone || '');
    setDescription(salon.description || '');
    setImagePreview(salon.image_url ? `http://localhost:8000${salon.image_url}` : null);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDeleteSalon = (id: number) => {
    if (window.confirm("Bu salonu və ona aid bütün məlumatları (xidmətlər, işçilər və s.) silmək istədiyinizə əminsiniz?")) {
      deleteSalonMutation.mutate(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Salonlarım</h1>
          <p className="text-zinc-500 mt-1">Bizneslərinizi buradan idarə edin</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="rounded-xl px-5">
          <Plus className="w-5 h-5 mr-2" />
          Yeni Salon
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-zinc-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salons.length === 0 ? (
             <div className="col-span-full py-12 text-center text-zinc-500">
               Hələ heç bir salonunuz yoxdur.
             </div>
          ) : (
            salons.map((salon: any) => (
              <Card key={salon.id} className="rounded-2xl border-0 shadow-sm overflow-hidden flex flex-col group relative">
                <div className="h-48 bg-zinc-200 relative overflow-hidden">
                  {salon.image_url ? (
                    <img src={`http://localhost:8000${salon.image_url}`} alt={salon.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-sm font-medium">Şəkil yoxdur</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditSalon(salon)}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-zinc-700 hover:text-zinc-950 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteSalon(salon.id)}
                      disabled={deleteSalonMutation.isPending}
                      className="w-10 h-10 bg-red-50/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {deleteSalonMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-zinc-900 mb-1">{salon.name}</h3>
                  <div className="flex items-center text-zinc-500 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{salon.address}</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create Salon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <Card className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-900">
                {editSalonId ? "Salonu Redaktə et" : "Yeni Salon Yarat"}
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="salon-form" onSubmit={handleSubmit} className="space-y-5">
                
                {/* Image Upload Section */}
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-2">Salonun Şəkli</label>
                  <div className="flex items-center justify-center w-full">
                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-zinc-200 border-dashed rounded-2xl cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-colors relative overflow-hidden">
                          {imagePreview ? (
                            <img src={imagePreview} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-zinc-500">
                                <ImageIcon className="w-10 h-10 mb-3 text-zinc-400" />
                                <p className="mb-1 text-sm font-semibold">Yükləmək üçün klikləyin</p>
                                <p className="text-xs">PNG, JPG or WEBP (Max: 5MB)</p>
                            </div>
                          )}
                          <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 block">Salon Adı</label>
                    <Input required placeholder="Məs: Beauty Lounge" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 block">Telefon</label>
                    <Input required placeholder="+994501234567" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 block">Ünvan</label>
                  <Input required placeholder="Nizami küç. 42" value={address} onChange={e => setAddress(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 block">Haqqında (İxtiyari)</label>
                  <textarea 
                    className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-none"
                    placeholder="Salon barədə qısa məlumat..."
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
                disabled={createSalonMutation.isPending || updateSalonMutation.isPending || isUploading}
              >
                Ləğv et
              </Button>
              <Button type="submit" form="salon-form" disabled={createSalonMutation.isPending || updateSalonMutation.isPending || isUploading}>
                {(createSalonMutation.isPending || updateSalonMutation.isPending || isUploading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editSalonId ? "Yadda Saxla" : "Yarat"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
