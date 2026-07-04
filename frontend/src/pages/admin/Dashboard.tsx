import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import api from '../../lib/api';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await api.get('/api/v1/users/me');
      return res.data;
    }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Xoş gəldiniz, {user?.full_name}! 👋</h1>
        <p className="text-zinc-500 mt-1">Salon biznesinizin ümumi vəziyyəti</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-0 shadow-sm rounded-2xl">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-zinc-500">Bugünkü Rezervasiyalar</h3>
          </div>
          <p className="text-2xl font-bold text-zinc-900">12</p>
        </Card>

        <Card className="p-4 border-0 shadow-sm rounded-2xl">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-zinc-500">Aylıq Gəlir</h3>
          </div>
          <p className="text-2xl font-bold text-zinc-900">2,450 ₼</p>
        </Card>

        <Card className="p-4 border-0 shadow-sm rounded-2xl">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-zinc-500">Müştərilər</h3>
          </div>
          <p className="text-2xl font-bold text-zinc-900">340</p>
        </Card>
        
        <Card className="p-4 border-0 shadow-sm rounded-2xl">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-zinc-500">Böyümə</h3>
          </div>
          <p className="text-2xl font-bold text-zinc-900">+15%</p>
        </Card>
      </div>

      {/* Quick Actions or Recent Bookings Placeholder */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">Son aktivlik</h2>
        <Card className="p-8 border-0 shadow-sm rounded-2xl text-center text-zinc-500">
          Bu bölmədə tezliklə daha detallı qrafiklər və son rezervasiyaların siyahısı olacaq.
        </Card>
      </div>
    </div>
  );
}
