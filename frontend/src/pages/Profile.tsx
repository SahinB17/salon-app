import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User as UserIcon, LogOut, Settings, ChevronRight, Lock, Trash2, Sun, Moon, Laptop, UserPen } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BottomSheet } from '../components/ui/BottomSheet';
import { PageWrapper } from '../components/ui/PageWrapper';
import { useTheme } from '../components/ThemeProvider';
import api from '../lib/api';

type SettingsView = 'menu' | 'profile' | 'password' | 'theme' | 'delete';

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsView, setSettingsView] = useState<SettingsView>('menu');

  // Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  // Fetch current user details
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/api/v1/users/me');
      return response.data;
    }
  });

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    queryClient.clear();
    navigate('/login');
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { full_name: string; phone: string }) => {
      const response = await api.put('/api/v1/users/me', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Məlumatlarınız uğurla yeniləndi!');
      setSettingsView('menu');
    },
    onError: () => {
      toast.error('Məlumatları yeniləyərkən xəta baş verdi.');
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put('/api/v1/users/me/password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Şifrəniz uğurla yeniləndi! Yenidən daxil olun.');
      handleLogout();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Şifrəni yeniləyərkən xəta baş verdi.');
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (password: string) => {
      // First verify password by trying to log in (or a specific delete endpoint could accept password)
      // Since our DELETE /me doesn't take a body, we will verify by checking password first.
      const formData = new URLSearchParams();
      formData.append('username', user.email);
      formData.append('password', password);
      await api.post('/api/v1/login/access-token', formData);
      // If success, proceed to delete
      await api.delete('/api/v1/users/me');
    },
    onSuccess: () => {
      toast.success('Hesabınız uğurla silindi.');
      handleLogout();
    },
    onError: () => {
      toast.error('Şifrə yanlışdır və ya xəta baş verdi.');
    }
  });

  return (
    <PageWrapper className="flex flex-col min-h-screen bg-[#FAFAFA] dark:bg-[#121212] pb-24 lg:pb-8 transition-colors">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="bg-white dark:bg-zinc-900 px-4 pt-12 lg:pt-16 pb-6 shadow-sm border-b border-zinc-100 dark:border-zinc-800 rounded-b-3xl transition-colors">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Profilim</h1>
          
          <div className="flex items-center">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0 transition-colors">
              <UserIcon className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
            </div>
            <div className="ml-4">
              {isLoading ? (
                <>
                  <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded"></div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{user?.full_name || 'İstifadəçi'}</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{user?.email}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-4 mt-8 space-y-3">
          <Card 
            onClick={() => {
              setSettingsView('menu');
              setIsSettingsOpen(true);
            }}
            className="p-4 rounded-2xl border-0 shadow-sm flex justify-between items-center bg-white dark:bg-zinc-900 cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="flex items-center text-zinc-700 dark:text-zinc-300 font-medium">
              <Settings className="w-5 h-5 mr-3 text-zinc-400 dark:text-zinc-500" />
              Tənzimləmələr
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
          </Card>

          <Card 
            onClick={handleLogout}
            className="p-4 rounded-2xl border-0 shadow-sm flex justify-between items-center bg-red-50 dark:bg-red-500/10 cursor-pointer active:scale-[0.98] transition-all mt-6"
          >
            <div className="flex items-center text-red-600 dark:text-red-400 font-bold">
              <LogOut className="w-5 h-5 mr-3" />
              Hesabdan Çıx
            </div>
          </Card>
        </div>
      </div>

      {/* Settings Bottom Sheet */}
      <BottomSheet
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setTimeout(() => setSettingsView('menu'), 300);
        }}
        title={
          settingsView === 'menu' ? 'Tənzimləmələr' :
          settingsView === 'profile' ? 'Şəxsi Məlumatlar' :
          settingsView === 'password' ? 'Şifrəni Yenilə' :
          settingsView === 'theme' ? 'Mövzu Seçimi' :
          'Hesabı Sil'
        }
      >
        <div className="space-y-4">
          {settingsView === 'menu' && (
            <div className="space-y-2">
              <div 
                onClick={() => setSettingsView('profile')}
                className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 cursor-pointer active:scale-[0.98] transition-all"
              >
                <div className="flex items-center text-zinc-900 dark:text-zinc-50 font-medium">
                  <UserPen className="w-5 h-5 mr-3 text-zinc-400 dark:text-zinc-500" />
                  Şəxsi məlumatlar
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
              </div>

              <div 
                onClick={() => setSettingsView('password')}
                className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 cursor-pointer active:scale-[0.98] transition-all"
              >
                <div className="flex items-center text-zinc-900 dark:text-zinc-50 font-medium">
                  <Lock className="w-5 h-5 mr-3 text-zinc-400 dark:text-zinc-500" />
                  Şifrəni yenilə
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
              </div>

              <div 
                onClick={() => setSettingsView('theme')}
                className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 cursor-pointer active:scale-[0.98] transition-all"
              >
                <div className="flex items-center text-zinc-900 dark:text-zinc-50 font-medium">
                  <Moon className="w-5 h-5 mr-3 text-zinc-400 dark:text-zinc-500" />
                  Mövzu və görünüş
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
              </div>

              <div 
                onClick={() => setSettingsView('delete')}
                className="flex items-center justify-between p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 cursor-pointer active:scale-[0.98] transition-all mt-6"
              >
                <div className="flex items-center text-red-600 dark:text-red-400 font-bold">
                  <Trash2 className="w-5 h-5 mr-3" />
                  Hesabı həmişəlik sil
                </div>
                <ChevronRight className="w-5 h-5 text-red-400" />
              </div>
            </div>
          )}

          {settingsView === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-zinc-900 dark:text-zinc-50 block mb-2">Ad və Soyad</label>
                <Input 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-zinc-900 dark:text-zinc-50 block mb-2">Telefon Nömrəsi</label>
                <Input 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+994 (--) --- -- --"
                  className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <Button className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => setSettingsView('menu')}>Geri</Button>
                <Button 
                  className="flex-1"
                  isLoading={updateProfileMutation.isPending}
                  onClick={() => updateProfileMutation.mutate({ full_name: fullName, phone })}
                >
                  Yadda Saxla
                </Button>
              </div>
            </div>
          )}

          {settingsView === 'password' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-zinc-900 dark:text-zinc-50 block mb-2">Cari Şifrə</label>
                <Input 
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-zinc-900 dark:text-zinc-50 block mb-2">Yeni Şifrə</label>
                <Input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <Button className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => setSettingsView('menu')}>Geri</Button>
                <Button 
                  className="flex-1"
                  isLoading={updatePasswordMutation.isPending}
                  disabled={!oldPassword || !newPassword}
                  onClick={() => updatePasswordMutation.mutate({ old_password: oldPassword, new_password: newPassword })}
                >
                  Yenilə
                </Button>
              </div>
            </div>
          )}

          {settingsView === 'theme' && (
            <div className="space-y-3">
              <div 
                onClick={() => setTheme('system')}
                className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${theme === 'system' ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800' : 'border-transparent bg-zinc-50 dark:bg-zinc-800/50'}`}
              >
                <Laptop className="w-5 h-5 mr-3 text-zinc-900 dark:text-zinc-50" />
                <span className="font-medium text-zinc-900 dark:text-zinc-50">Sistemə Uyğun</span>
              </div>
              <div 
                onClick={() => setTheme('light')}
                className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${theme === 'light' ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800' : 'border-transparent bg-zinc-50 dark:bg-zinc-800/50'}`}
              >
                <Sun className="w-5 h-5 mr-3 text-zinc-900 dark:text-zinc-50" />
                <span className="font-medium text-zinc-900 dark:text-zinc-50">Gündüz (Light)</span>
              </div>
              <div 
                onClick={() => setTheme('dark')}
                className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${theme === 'dark' ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800' : 'border-transparent bg-zinc-50 dark:bg-zinc-800/50'}`}
              >
                <Moon className="w-5 h-5 mr-3 text-zinc-900 dark:text-zinc-50" />
                <span className="font-medium text-zinc-900 dark:text-zinc-50">Gecə (Dark)</span>
              </div>
              <div className="pt-2">
                <Button className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => setSettingsView('menu')}>Geri</Button>
              </div>
            </div>
          )}

          {settingsView === 'delete' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl text-red-700 dark:text-red-400 text-sm font-medium text-center">
                Diqqət! Bu əməliyyat geri qaytarıla bilməz. Hesabınız və bütün rezervasiyalarınız silinəcək.
              </div>
              <div>
                <label className="text-sm font-bold text-zinc-900 dark:text-zinc-50 block mb-2">Təsdiq üçün şifrənizi daxil edin</label>
                <Input 
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="bg-white dark:bg-zinc-900 border-red-200 dark:border-red-500/30 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <Button className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => setSettingsView('menu')}>Ləğv et</Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
                  isLoading={deleteAccountMutation.isPending}
                  disabled={!deletePassword}
                  onClick={() => deleteAccountMutation.mutate(deletePassword)}
                >
                  Hesabı Sil
                </Button>
              </div>
            </div>
          )}
        </div>
      </BottomSheet>
    </PageWrapper>
  );
}
