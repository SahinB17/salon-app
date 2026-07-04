import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Scissors } from 'lucide-react';
import api from '../lib/api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });
  
  // Validation and Error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState('');

  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/v1/users/', {
        ...formData,
        role: "salon_admin" // Defaulting to salon_admin for this interface
      });
      return response.data;
    },
    onSuccess: () => {
      // Pushing them back to login page
      navigate('/login');
    },
    onError: (error: any) => {
      setErrorMsg(
        error.response?.data?.detail || 'Qeydiyyat zamanı xəta baş verdi. Zəhmət olmasa təkrar cəhd edin.'
      );
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMsg('');
    
    const newErrors: Record<string, string> = {};
    if (formData.full_name.trim().length < 3) {
      newErrors.full_name = 'Ad ən azı 3 simvol olmalıdır';
    }
    if (formData.phone.length < 8) {
      newErrors.phone = 'Düzgün mobil nömrə daxil edin';
    }
    if (!formData.email.includes('@')) {
      newErrors.email = 'Düzgün e-poçt ünvanı daxil edin';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Şifrə ən azı 6 simvol olmalıdır';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-200/50 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-200/50 blur-[100px] pointer-events-none" />

      <Card className="max-w-[450px] w-full relative z-10">
        <CardHeader className="items-center pb-6">
          <div className="h-12 w-12 bg-zinc-950 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-zinc-950/20">
            <Scissors className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 text-center">
            Qeydiyyatdan keçin
          </h2>
          <p className="text-sm text-zinc-500 text-center mt-2">
            Yeni salon hesabınızı yaratmaq üçün formanı doldurun
          </p>
        </CardHeader>
        
        <CardContent>
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
              {errorMsg}
            </div>
          )}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 block">Ad və Soyad</label>
                  <Input
                    name="full_name"
                    required
                    placeholder="Əli Əliyev"
                    value={formData.full_name}
                    onChange={handleChange}
                    error={!!errors.full_name}
                  />
                  {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 block">Mobil nömrə</label>
                  <Input
                    name="phone"
                    required
                    placeholder="+994501234567"
                    value={formData.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 block">E-poçt ünvanı</label>
                <Input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="ad@numune.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 block">Şifrə</label>
                <Input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={registerMutation.isPending}>
              Hesab yarat
            </Button>
            
            <p className="text-center text-sm text-zinc-500 mt-6">
              Artıq hesabınız var?{' '}
              <Link to="/login" className="font-medium text-zinc-950 hover:underline underline-offset-4">
                Daxil olun
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
