import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User as UserIcon, LogOut, Settings, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { PageWrapper } from '../components/ui/PageWrapper';
import api from '../lib/api';

export default function Profile() {
  const navigate = useNavigate();

  // Fetch current user details
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/api/v1/users/me');
      return response.data;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <PageWrapper className="flex flex-col min-h-screen bg-[#FAFAFA] dark:bg-[#121212] pb-24 lg:pb-8 transition-colors">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="bg-white dark:bg-zinc-900 px-4 pt-12 lg:pt-16 pb-6 shadow-sm border-b border-zinc-100 dark:border-zinc-800 rounded-b-3xl transition-colors">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Profilim</h1>
          
          <div className="flex items-center">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0">
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
          <Card className="p-4 rounded-2xl border-0 shadow-sm flex justify-between items-center bg-white dark:bg-zinc-900 cursor-pointer active:scale-[0.98] transition-all">
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
    </PageWrapper>
  );
}
