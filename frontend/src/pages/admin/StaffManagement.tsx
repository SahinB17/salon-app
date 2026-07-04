import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Loader2, UserCheck, UserX, User } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../lib/api';

export default function StaffManagement() {
  const queryClient = useQueryClient();
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editStaffId, setEditStaffId] = useState<number | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('18:00');
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const weekDayNames = [
    { label: 'B.e.', value: 1 },
    { label: 'Ç.a.', value: 2 },
    { label: 'Ç.', value: 3 },
    { label: 'C.a.', value: 4 },
    { label: 'C.', value: 5 },
    { label: 'Ş.', value: 6 },
    { label: 'B.', value: 7 },
  ];

  // Get user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await api.get('/api/v1/users/me');
      return res.data;
    }
  });

  // Fetch admin's salons
  const { data: salons = [], isLoading: isSalonsLoading } = useQuery({
    queryKey: ['adminSalons'],
    queryFn: async () => {
      const res = await api.get('/api/v1/salons/');
      const mySalons = res.data.filter((s: any) => s.owner_id === user?.id);
      if (mySalons.length > 0 && !selectedSalonId) {
        setSelectedSalonId(mySalons[0].id);
      }
      return mySalons;
    },
    enabled: !!user?.id
  });

  // Fetch staff for selected salon
  const { data: staffList = [], isLoading: isStaffLoading } = useQuery({
    queryKey: ['staff', selectedSalonId],
    queryFn: async () => {
      if (!selectedSalonId) return [];
      const res = await api.get(`/api/v1/staff/salon/${selectedSalonId}`);
      return res.data;
    },
    enabled: !!selectedSalonId
  });

  // Mutations
  const createStaffMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/api/v1/staff/', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', selectedSalonId] });
      resetForm();
    }
  });

  const updateStaffMutation = useMutation({
    mutationFn: async (data: { id: number; staffData: any }) => {
      const res = await api.patch(`/api/v1/staff/${data.id}`, data.staffData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', selectedSalonId] });
      resetForm();
    }
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/api/v1/staff/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', selectedSalonId] });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (data: { id: number; is_active: boolean }) => {
      const res = await api.patch(`/api/v1/staff/${data.id}`, { is_active: data.is_active });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', selectedSalonId] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalonId) return;

    const staffPayload = {
      full_name: fullName,
      specialty: specialty || null,
      work_start: workStart ? `${workStart}:00` : null,
      work_end: workEnd ? `${workEnd}:00` : null,
      working_days: workingDays.sort((a, b) => a - b).join(','),
    };

    if (editStaffId) {
      updateStaffMutation.mutate({
        id: editStaffId,
        staffData: staffPayload
      });
    } else {
      createStaffMutation.mutate({
        ...staffPayload,
        salon_id: selectedSalonId
      });
    }
  };

  const handleEditStaff = (staff: any) => {
    setEditStaffId(staff.id);
    setFullName(staff.full_name);
    setSpecialty(staff.specialty || '');
    setWorkStart(staff.work_start ? staff.work_start.substring(0, 5) : '09:00');
    setWorkEnd(staff.work_end ? staff.work_end.substring(0, 5) : '18:00');
    
    if (staff.working_days) {
      setWorkingDays(staff.working_days.split(',').map(Number));
    } else {
      setWorkingDays([1, 2, 3, 4, 5]);
    }
    
    setIsModalOpen(true);
  };

  const handleDeleteStaff = (id: number) => {
    if (window.confirm("Bu işçini silmək istədiyinizə əminsiniz?")) {
      deleteStaffMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFullName('');
    setSpecialty('');
    setWorkStart('09:00');
    setWorkEnd('18:00');
    setWorkingDays([1, 2, 3, 4, 5]);
    setEditStaffId(null);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">İşçilər</h1>
          <p className="text-zinc-500 mt-1">Salonlarınızdakı ustaları idarə edin</p>
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
            Yeni İşçi
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
          İşçiləri görmək üçün yuxarıdan salon seçin.
        </div>
      ) : isStaffLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-zinc-200 rounded-2xl w-full" />
          <div className="h-24 bg-zinc-200 rounded-2xl w-full" />
        </div>
      ) : staffList.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 bg-zinc-50 rounded-2xl border border-zinc-200 border-dashed">
          Bu salon üçün hələ heç bir işçi əlavə edilməyib.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((staff: any) => (
            <Card key={staff.id} className="p-5 border-0 shadow-sm rounded-2xl flex flex-col group relative">
              <div className="flex justify-between items-start mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${staff.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                  <User className="w-6 h-6" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleActiveMutation.mutate({ id: staff.id, is_active: !staff.is_active })}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${staff.is_active ? 'bg-amber-50 text-amber-500 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'}`}
                    title={staff.is_active ? 'Deaktiv et' : 'Aktiv et'}
                  >
                    {staff.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEditStaff(staff)}
                    className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center hover:bg-zinc-200 hover:text-zinc-900 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(staff.id)}
                    className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
                    disabled={deleteStaffMutation.isPending}
                  >
                    {deleteStaffMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">{staff.full_name}</h3>
              {staff.specialty && (
                <p className="text-sm text-zinc-500 mb-2">{staff.specialty}</p>
              )}
              
              <div className="mt-2 space-y-1 text-xs text-zinc-500 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                <div className="flex justify-between">
                  <span className="font-medium text-zinc-400">İş vaxtı:</span>
                  <span className="font-semibold text-zinc-700">
                    {staff.work_start ? staff.work_start.substring(0, 5) : '09:00'} - {staff.work_end ? staff.work_end.substring(0, 5) : '18:00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-zinc-400">İş günləri:</span>
                  <span className="font-semibold text-zinc-700">
                    {staff.working_days
                      ? staff.working_days.split(',').map((d: string) => {
                          const matched = weekDayNames.find(w => w.value === Number(d));
                          return matched ? matched.label : '';
                        }).join(', ')
                      : 'Məlumat yoxdur'}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${staff.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                  {staff.is_active ? '● Aktiv' : '○ Deaktiv'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-900">
                {editStaffId ? "İşçini Redaktə et" : "Yeni İşçi Əlavə Et"}
              </h2>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="staff-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 block">Ad və Soyad</label>
                  <Input required placeholder="Məs: Əli Əliyev" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 block">İxtisas (İxtiyari)</label>
                  <Input placeholder="Məs: Saç ustası, Dırnaq ustası" value={specialty} onChange={e => setSpecialty(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 block">İşin başlanğıcı</label>
                    <Input type="time" value={workStart} onChange={e => setWorkStart(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 block">İşin bitməsi</label>
                    <Input type="time" value={workEnd} onChange={e => setWorkEnd(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 block">İş günləri</label>
                  <div className="flex flex-wrap gap-2">
                    {weekDayNames.map((day) => {
                      const isChecked = workingDays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setWorkingDays(workingDays.filter(v => v !== day.value));
                            } else {
                              setWorkingDays([...workingDays, day.value]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${isChecked ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-zinc-100 flex justify-end space-x-3 bg-zinc-50/50 rounded-b-3xl">
              <Button
                type="button"
                className="bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50"
                onClick={resetForm}
                disabled={createStaffMutation.isPending || updateStaffMutation.isPending}
              >
                Ləğv et
              </Button>
              <Button type="submit" form="staff-form" disabled={createStaffMutation.isPending || updateStaffMutation.isPending}>
                {(createStaffMutation.isPending || updateStaffMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editStaffId ? "Yadda Saxla" : "Əlavə Et"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
