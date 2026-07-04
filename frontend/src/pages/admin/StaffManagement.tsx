import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Loader2, UserCheck, UserX, User, ChevronDown, Check } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../lib/api';

export default function StaffManagement() {
  const queryClient = useQueryClient();
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editStaffId, setEditStaffId] = useState<number | null>(null);
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight transition-colors">İşçilər</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 transition-colors">Salonlarınızdakı ustaları idarə edin</p>
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
            Yeni İşçi
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
          İşçiləri görmək üçün yuxarıdan salon seçin.
        </div>
      ) : isStaffLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full transition-colors" />
          <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full transition-colors" />
        </div>
      ) : staffList.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed transition-colors">
          Bu salon üçün hələ heç bir işçi əlavə edilməyib.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((staff: any) => (
            <Card key={staff.id} className="p-5 border-0 shadow-sm rounded-2xl flex flex-col group relative dark:bg-zinc-900 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${staff.is_active ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'}`}>
                  <User className="w-6 h-6" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleActiveMutation.mutate({ id: staff.id, is_active: !staff.is_active })}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${staff.is_active ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'}`}
                    title={staff.is_active ? 'Deaktiv et' : 'Aktiv et'}
                  >
                    {staff.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEditStaff(staff)}
                    className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(staff.id)}
                    className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                    disabled={deleteStaffMutation.isPending}
                  >
                    {deleteStaffMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-1 transition-colors">{staff.full_name}</h3>
              {staff.specialty && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2 transition-colors">{staff.specialty}</p>
              )}
              
              <div className="mt-2 space-y-1 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 transition-colors">
                <div className="flex justify-between">
                  <span className="font-medium text-zinc-400 dark:text-zinc-500 transition-colors">İş vaxtı:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 transition-colors">
                    {staff.work_start ? staff.work_start.substring(0, 5) : '09:00'} - {staff.work_end ? staff.work_end.substring(0, 5) : '18:00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-zinc-400 dark:text-zinc-500 transition-colors">İş günləri:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 transition-colors">
                    {staff.working_days
                      ? staff.working_days.split(',').map((d: string) => {
                          const matched = weekDayNames.find(w => w.value === Number(d));
                          return matched ? matched.label : '';
                        }).join(', ')
                      : 'Məlumat yoxdur'}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between transition-colors">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${staff.is_active ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                  {staff.is_active ? '● Aktiv' : '○ Deaktiv'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-sm transition-colors">
          <Card className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] transition-colors border-0 dark:border dark:border-zinc-800">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 transition-colors">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 transition-colors">
                {editStaffId ? "İşçini Redaktə et" : "Yeni İşçi Əlavə Et"}
              </h2>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="staff-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block transition-colors">Ad və Soyad</label>
                  <Input required placeholder="Məs: Əli Əliyev" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block transition-colors">İxtisas (İxtiyari)</label>
                  <Input placeholder="Məs: Saç ustası, Dırnaq ustası" value={specialty} onChange={e => setSpecialty(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block transition-colors">İşin başlanğıcı</label>
                    <Input type="time" value={workStart} onChange={e => setWorkStart(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block transition-colors">İşin bitməsi</label>
                    <Input type="time" value={workEnd} onChange={e => setWorkEnd(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block transition-colors">İş günləri</label>
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${isChecked ? 'bg-zinc-900 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-50 text-white dark:text-zinc-900 shadow-sm' : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end space-x-3 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-3xl transition-colors">
              <Button
                type="button"
                className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
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
