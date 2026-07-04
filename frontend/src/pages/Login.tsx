import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Scissors } from 'lucide-react';
import api from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Validation and Error states
  const [errors, setErrors] = useState<{email?: string, password?: string}>({});
  const [errorMsg, setErrorMsg] = useState('');

  const loginMutation = useMutation({
    mutationFn: async () => {
      const formData = new URLSearchParams();
      formData.append('username', email); // FastAPI OAuth2 expects 'username'
      formData.append('password', password);
      
      const response = await api.post('/api/v1/login/access-token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      
      if (data.role === 'salon_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    },
    onError: () => {
      setErrorMsg('E-poçt ünvanı və ya şifrə yanlışdır.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMsg('');
    
    const newErrors: {email?: string, password?: string} = {};
    if (!email.includes('@')) {
      newErrors.email = 'Düzgün e-poçt ünvanı daxil edin';
    }
    if (password.length < 6) {
      newErrors.password = 'Şifrə ən azı 6 simvol olmalıdır';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Subtle modern background gradient circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-200/50 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-200/50 blur-[100px] pointer-events-none" />

      <Card className="max-w-[400px] w-full relative z-10">
        <CardHeader className="items-center pb-6">
          <div className="h-12 w-12 bg-zinc-950 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-zinc-950/20">
            <Scissors className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 text-center">
            Xoş gəlmisiniz
          </h2>
          <p className="text-sm text-zinc-500 text-center mt-2">
            Salona daxil olmaq üçün məlumatlarınızı daxil edin
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
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 block">E-poçt ünvanı</label>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="ad@numune.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.email}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700 block">Şifrə</label>
                  <Link to="/forgot-password" className="text-xs text-zinc-500 hover:text-zinc-950 transition-colors">
                    Şifrəni unutmusunuz?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!errors.password}
                />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={loginMutation.isPending}>
              Daxil ol
            </Button>
            
            <p className="text-center text-sm text-zinc-500 mt-6">
              Hesabınız yoxdur?{' '}
              <Link to="/register" className="font-medium text-zinc-950 hover:underline underline-offset-4">
                Qeydiyyatdan keçin
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
