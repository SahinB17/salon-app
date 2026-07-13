import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Scissors, Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft, KeyRound } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'register' | 'forgot_password';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view, setView] = useState<AuthView>('login');
  
  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Register States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [registerRole, setRegisterRole] = useState<'customer' | 'salon_admin'>('customer');
  
  // Error States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState('');

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const resetState = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setRegisterRole('customer');
    setErrors({});
    setErrorMsg('');
    setView('login');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const loginMutation = useMutation({
    mutationFn: async () => {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await api.post('/api/v1/login/access-token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      // Save token immediately to prevent interceptor race conditions
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      queryClient.invalidateQueries();
      toast.success('Uğurla giriş etdiniz! 🎉');
      handleClose();

      if (data.role === 'salon_admin') {
        navigate('/admin/dashboard');
      }
    },
    onError: () => {
      setErrorMsg('E-poçt ünvanı və ya şifrə yanlışdır.');
    }
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/v1/users/', {
        email,
        password,
        full_name: fullName,
        phone,
        role: registerRole
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Qeydiyyat uğurla tamamlandı! İndi giriş edə bilərsiniz.');
      setView('login');
      setPassword('');
      setErrors({});
      setErrorMsg('');
    },
    onError: (error: any) => {
      setErrorMsg(
        error.response?.data?.detail || 'Qeydiyyat zamanı xəta baş verdi. Zəhmət olmasa təkrar cəhd edin.'
      );
    }
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/v1/login/password-recovery/${email}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Şifrə sıfırlama linki e-poçtunuza göndərildi!');
      setView('login');
      setErrors({});
      setErrorMsg('');
    },
    onError: () => {
      setErrorMsg('Bu e-poçt ünvanı ilə istifadəçi tapılmadı.');
    }
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMsg('');
    
    const newErrors: Record<string, string> = {};
    if (!email.includes('@')) newErrors.email = 'Düzgün e-poçt ünvanı daxil edin';
    if (password.length < 6) newErrors.password = 'Şifrə ən azı 6 simvol olmalıdır';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    loginMutation.mutate();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMsg('');
    
    const newErrors: Record<string, string> = {};
    if (fullName.trim().length < 3) newErrors.full_name = 'Ad ən azı 3 simvol olmalıdır';
    const phoneRegex = /^(?:\+994|0)(10|50|51|55|70|77|99)\d{7}$/;
    if (!phoneRegex.test(phone)) newErrors.phone = 'Format: 0501234567 və ya +99450...';
    if (!email.includes('@')) newErrors.email = 'Düzgün e-poçt ünvanı daxil edin';
    if (password.length < 6) newErrors.password = 'Şifrə ən azı 6 simvol olmalıdır';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    registerMutation.mutate();
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMsg('');
    
    if (!email.includes('@')) {
      setErrors({ email: 'Düzgün e-poçt ünvanı daxil edin' });
      return;
    }
    
    forgotPasswordMutation.mutate();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative z-10 w-full sm:max-w-md bg-white dark:bg-[#121212] rounded-t-[2rem] sm:rounded-[1.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl p-6 sm:p-8 overflow-y-auto overflow-x-hidden transition-colors flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                {view !== 'login' ? (
                  <button onClick={() => { setView('login'); setErrors({}); setErrorMsg(''); }} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <Scissors className="w-6 h-6 text-amber-500" />
                )}
                <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {view === 'login' ? 'Daxil ol' : view === 'register' ? 'Qeydiyyat' : 'Şifrənin bərpası'}
                </span>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Login View */}
            {view === 'login' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block mb-1.5 uppercase tracking-wider">E-poçt</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"><Mail className="w-4 h-4" /></span>
                      <Input
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nümunə@mail.com"
                        className="pl-11 h-12 bg-zinc-50 dark:bg-[#161616] border-zinc-200/80 dark:border-zinc-800/60 focus:border-amber-500/50 dark:focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all rounded-xl w-full"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs font-semibold mt-1.5 pl-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block mb-1.5 uppercase tracking-wider">Şifrə</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"><Lock className="w-4 h-4" /></span>
                      <Input
                        type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                        className="pl-11 pr-11 h-12 bg-zinc-50 dark:bg-[#161616] border-zinc-200/80 dark:border-zinc-800/60 focus:border-amber-500/50 dark:focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all rounded-xl w-full"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs font-semibold mt-1.5 pl-1">{errors.password}</p>}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button type="button" onClick={() => { setView('forgot_password'); setErrors({}); setErrorMsg(''); }} className="text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors">
                      Şifrəni unutmusunuz?
                    </button>
                  </div>

                  <Button type="submit" className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/10 mt-2" isLoading={loginMutation.isPending}>
                    Daxil ol
                  </Button>
                </form>
                <div className="mt-6 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Hesabınız yoxdur?{' '}
                  <button type="button" onClick={() => { setView('register'); setErrors({}); setErrorMsg(''); }} className="text-amber-500 font-bold hover:text-amber-600 transition-colors">
                    Qeydiyyatdan keçin
                  </button>
                </div>
              </motion.div>
            )}

            {/* Register View */}
            {view === 'register' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                {/* Role Selection */}
                <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => setRegisterRole('customer')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      registerRole === 'customer' 
                        ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-zinc-50 shadow-sm' 
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    Müştəri
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterRole('salon_admin')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      registerRole === 'salon_admin' 
                        ? 'bg-amber-500 text-amber-950 shadow-sm' 
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    Salon Sahibi
                  </button>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block mb-1.5 uppercase tracking-wider">
                      {registerRole === 'salon_admin' ? 'Ad və Soyad (Sahib)' : 'Ad və Soyad'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"><User className="w-4 h-4" /></span>
                      <Input
                        type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Əli Əliyev"
                        className="pl-11 h-12 bg-zinc-50 dark:bg-[#161616] border-zinc-200/80 dark:border-zinc-800/60 focus:border-amber-500/50 dark:focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all rounded-xl w-full"
                      />
                    </div>
                    {errors.full_name && <p className="text-red-500 text-xs font-semibold mt-1.5 pl-1">{errors.full_name}</p>}
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block mb-1.5 uppercase tracking-wider">Mobil nömrə</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"><Phone className="w-4 h-4" /></span>
                      <Input
                        type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0501234567"
                        className="pl-11 h-12 bg-zinc-50 dark:bg-[#161616] border-zinc-200/80 dark:border-zinc-800/60 focus:border-amber-500/50 dark:focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all rounded-xl w-full"
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs font-semibold mt-1.5 pl-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block mb-1.5 uppercase tracking-wider">E-poçt</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"><Mail className="w-4 h-4" /></span>
                      <Input
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nümunə@mail.com"
                        className="pl-11 h-12 bg-zinc-50 dark:bg-[#161616] border-zinc-200/80 dark:border-zinc-800/60 focus:border-amber-500/50 dark:focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all rounded-xl w-full"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs font-semibold mt-1.5 pl-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block mb-1.5 uppercase tracking-wider">Şifrə</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"><Lock className="w-4 h-4" /></span>
                      <Input
                        type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                        className="pl-11 pr-11 h-12 bg-zinc-50 dark:bg-[#161616] border-zinc-200/80 dark:border-zinc-800/60 focus:border-amber-500/50 dark:focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all rounded-xl w-full"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs font-semibold mt-1.5 pl-1">{errors.password}</p>}
                  </div>

                  <Button type="submit" className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/10 mt-2" isLoading={registerMutation.isPending}>
                    Qeydiyyatdan keç
                  </Button>
                </form>
                <div className="mt-6 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Artıq hesabınız var?{' '}
                  <button type="button" onClick={() => { setView('login'); setErrors({}); setErrorMsg(''); }} className="text-amber-500 font-bold hover:text-amber-600 transition-colors">
                    Daxil olun
                  </button>
                </div>
              </motion.div>
            )}

            {/* Forgot Password View */}
            {view === 'forgot_password' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="mb-6 text-center">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <KeyRound className="w-6 h-6 text-amber-500" />
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Narahat olmayın, e-poçt ünvanınızı daxil edin, şifrənizi sıfırlamaq üçün link göndərəcəyik.
                  </p>
                </div>

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block mb-1.5 uppercase tracking-wider">E-poçt</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"><Mail className="w-4 h-4" /></span>
                      <Input
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nümunə@mail.com"
                        className="pl-11 h-12 bg-zinc-50 dark:bg-[#161616] border-zinc-200/80 dark:border-zinc-800/60 focus:border-amber-500/50 dark:focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all rounded-xl w-full"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs font-semibold mt-1.5 pl-1">{errors.email}</p>}
                  </div>

                  <Button type="submit" className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/10 mt-2" isLoading={forgotPasswordMutation.isPending}>
                    Bərpa linkini göndər
                  </Button>
                </form>
                <div className="mt-6 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Xatırladınız?{' '}
                  <button type="button" onClick={() => { setView('login'); setErrors({}); setErrorMsg(''); }} className="text-amber-500 font-bold hover:text-amber-600 transition-colors">
                    Geri qayıt
                  </button>
                </div>
              </motion.div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
