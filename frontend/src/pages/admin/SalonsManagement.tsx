import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Image as ImageIcon, MapPin, Edit2, Trash2, Loader2, Images, X } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import api from '../../lib/api';
import { DEFAULT_SALON_IMAGE } from '../../lib/constants';

export default function SalonsManagement() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSalonId, setEditSalonId] = useState<number | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Gallery State
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [activeGallerySalon, setActiveGallerySalon] = useState<any>(null);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);

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
      toast.success("Salon uğurla yaradıldı!");
    },
    onError: () => toast.error("Salon yaradılarkən xəta baş verdi.")
  });

  const updateSalonMutation = useMutation({
    mutationFn: async (data: { id: number; salonData: any }) => {
      const res = await api.put(`/api/v1/salons/${data.id}`, data.salonData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSalons'] });
      resetForm();
      toast.success("Salon məlumatları yeniləndi!");
    },
    onError: () => toast.error("Salon yenilənərkən xəta baş verdi.")
  });

  const deleteSalonMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/api/v1/salons/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSalons'] });
      toast.success("Salon uğurla silindi!");
    },
    onError: () => toast.error("Salon silinərkən xəta baş verdi.")
  });

  const uploadGalleryImageMutation = useMutation({
    mutationFn: async (data: { salonId: number; imageUrl: string }) => {
      const res = await api.post(`/api/v1/salons/${data.salonId}/images`, { 
        image_url: data.imageUrl, 
        salon_id: data.salonId 
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSalons'] });
      // Update active gallery salon
      if (activeGallerySalon) {
        queryClient.fetchQuery({ queryKey: ['adminSalons'] }).then((data: any) => {
          const updatedSalon = data?.find((s: any) => s.id === activeGallerySalon.id);
          if (updatedSalon) setActiveGallerySalon(updatedSalon);
        });
      }
      toast.success("Şəkil qalereyaya əlavə edildi!");
    },
    onError: () => toast.error("Şəkil yüklənərkən xəta baş verdi.")
  });

  const deleteGalleryImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const res = await api.delete(`/api/v1/salons/images/${imageId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSalons'] });
      if (activeGallerySalon) {
        queryClient.fetchQuery({ queryKey: ['adminSalons'] }).then((data: any) => {
          const updatedSalon = data?.find((s: any) => s.id === activeGallerySalon.id);
          if (updatedSalon) setActiveGallerySalon(updatedSalon);
        });
      }
      toast.success("Şəkil qalereyadan silindi!");
    },
    onError: () => toast.error("Şəkil silinərkən xəta baş verdi.")
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeGallerySalon) {
      setIsGalleryUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await api.post('/api/v1/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const uploadedImageUrl = uploadRes.data.image_url;
        await uploadGalleryImageMutation.mutateAsync({ salonId: activeGallerySalon.id, imageUrl: uploadedImageUrl });
      } catch (error) {
        console.error("Şəkil yüklənərkən xəta:", error);
      } finally {
        setIsGalleryUploading(false);
      }
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
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      open_time: "09:00:00",
      close_time: "21:00:00",
      ...(uploadedImageUrl ? { image_url: uploadedImageUrl } : {})
    };

    if (editSalonId) {
      updateSalonMutation.mutate({ id: editSalonId, salonData });
    } else {
      createSalonMutation.mutate({ ...salonData });
    }
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setPhone('');
    setDescription('');
    setLatitude('');
    setLongitude('');
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
    setLatitude(salon.latitude ? String(salon.latitude) : '');
    setLongitude(salon.longitude ? String(salon.longitude) : '');
    setImagePreview(salon.image_url ? `${window.location.protocol}//${window.location.hostname}${window.location.port === '5173' ? ':8000' : ''}${salon.image_url}` : null);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openGalleryModal = (salon: any) => {
    setActiveGallerySalon(salon);
    setIsGalleryModalOpen(true);
  };

  const handleDeleteSalon = (id: number) => {
    if (window.confirm("Bu salonu və ona aid bütün məlumatları (xidmətlər, işçilər və s.) silmək istədiyinizə əminsiniz?")) {
      deleteSalonMutation.mutate(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-1">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight transition-colors">Salonlarım</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 transition-colors">Bizneslərinizi buradan idarə edin</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="rounded-2xl h-12 sm:h-11 px-6 shadow-md transition-all active:scale-95 w-full sm:w-auto text-xs font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Salon
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-2xl transition-colors" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salons.length === 0 ? (
             <div className="col-span-full py-12 text-center text-zinc-500 dark:text-zinc-400 transition-colors">
               Hələ heç bir salonunuz yoxdur.
             </div>
          ) : (
            salons.map((salon: any) => (
              <Card key={salon.id} className="rounded-2xl border-0 shadow-sm overflow-hidden flex flex-col group relative dark:bg-zinc-900 transition-colors">
                <div className="h-48 bg-zinc-200 dark:bg-zinc-800 relative overflow-hidden transition-colors">
                  {salon.image_url ? (
                    <img src={`${window.location.protocol}//${window.location.hostname}${window.location.port === '5173' ? ':8000' : ''}${salon.image_url}`} alt={salon.name} className="w-full h-full object-cover" />
                  ) : (
                    <img src={DEFAULT_SALON_IMAGE} alt={salon.name} className="w-full h-full object-cover opacity-80" />
                  )}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openGalleryModal(salon)}
                      title="Qalereya"
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      <Images className="w-4 h-4" />
                    </button>
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
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1 transition-colors">{salon.name}</h3>
                  <div className="flex items-center text-zinc-500 dark:text-zinc-400 text-sm mb-3 transition-colors">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-sm transition-colors">
          <Card className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] transition-colors border-0 dark:border dark:border-zinc-800">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 transition-colors">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 transition-colors">
                {editSalonId ? "Salonu Redaktə et" : "Yeni Salon Yarat"}
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="salon-form" onSubmit={handleSubmit} className="space-y-5">
                
                {/* Image Upload Section */}
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2 transition-colors">Salonun Şəkli</label>
                  <div className="flex items-center justify-center w-full">
                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-zinc-200 dark:border-zinc-800 border-dashed rounded-2xl cursor-pointer bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative overflow-hidden">
                          {imagePreview ? (
                            <img src={imagePreview} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-zinc-500 dark:text-zinc-400 transition-colors">
                                <ImageIcon className="w-10 h-10 mb-3 text-zinc-400 dark:text-zinc-500 transition-colors" />
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
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block transition-colors">Salon Adı</label>
                    <Input required placeholder="Məs: Beauty Lounge" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block transition-colors">Telefon</label>
                    <Input required placeholder="+994501234567" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block transition-colors">Ünvan</label>
                  <Input required placeholder="Nizami küç. 42" value={address} onChange={e => setAddress(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block transition-colors">Enlik (Latitude)</label>
                    <Input type="number" step="any" placeholder="40.4093" value={latitude} onChange={e => setLatitude(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block transition-colors">Uzunluq (Longitude)</label>
                    <Input type="number" step="any" placeholder="49.8671" value={longitude} onChange={e => setLongitude(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block transition-colors">Haqqında (İxtiyari)</label>
                  <textarea 
                    className="flex w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 px-3 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-none"
                    placeholder="Salon barədə qısa məlumat..."
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

      {/* Gallery Modal */}
      {isGalleryModalOpen && activeGallerySalon && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-sm transition-colors">
          <Card className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] transition-colors border-0 dark:border dark:border-zinc-800">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center transition-colors">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 transition-colors">Qalereya</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 transition-colors">{activeGallerySalon.name}</p>
              </div>
              <button onClick={() => setIsGalleryModalOpen(false)} className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Add New Image Box */}
                <label className="flex flex-col items-center justify-center h-32 border-2 border-zinc-200 dark:border-zinc-800 border-dashed rounded-2xl cursor-pointer bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative overflow-hidden">
                  {isGalleryUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-400 dark:text-zinc-500 transition-colors" />
                  ) : (
                    <>
                      <Plus className="w-6 h-6 text-zinc-400 dark:text-zinc-500 mb-2 transition-colors" />
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 transition-colors">Şəkil əlavə et</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleGalleryImageUpload} disabled={isGalleryUploading} />
                </label>

                {/* Existing Images */}
                {activeGallerySalon.images?.map((img: any) => (
                  <div key={img.id} className="relative h-32 rounded-2xl overflow-hidden group border border-zinc-100 dark:border-zinc-800 transition-colors">
                    <img src={`${window.location.protocol}//${window.location.hostname}${window.location.port === '5173' ? ':8000' : ''}${img.image_url}`} alt="Qalereya" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => deleteGalleryImageMutation.mutate(img.id)}
                        disabled={deleteGalleryImageMutation.isPending}
                        className="w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
