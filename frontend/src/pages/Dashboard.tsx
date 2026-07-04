import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-950">İdarəetmə Paneli</h1>
        <Button 
          onClick={handleLogout} 
          className="bg-white text-zinc-950 border border-zinc-200 hover:bg-zinc-50 shadow-none"
        >
          Çıxış et
        </Button>
      </header>
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="p-8 border border-zinc-200/60 bg-white rounded-2xl shadow-sm text-center mt-12">
            <h2 className="text-2xl font-semibold text-zinc-950 mb-2">Salona xoş gəlmisiniz!</h2>
            <p className="text-zinc-500">Tezliklə bura idarəetmə məlumatları ilə dolacaq.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
