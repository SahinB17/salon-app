import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Scissors, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending email since we don't have SMTP yet
    setTimeout(() => {
      setIsSent(true);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-200/50 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-200/50 blur-[100px] pointer-events-none" />

      <Card className="max-w-[400px] w-full relative z-10">
        <CardHeader className="items-center pb-6">
          <div className="h-12 w-12 bg-zinc-950 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-zinc-950/20">
            <Scissors className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 text-center">
            Şifrənin Bərpası
          </h2>
          <p className="text-sm text-zinc-500 text-center mt-2">
            E-poçt ünvanınızı daxil edin, sizə bərpa linki göndərəcəyik
          </p>
        </CardHeader>
        
        <CardContent>
          {isSent ? (
            <div className="text-center space-y-6">
              <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex flex-col items-center justify-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-green-600 mb-1" />
                <p className="text-sm font-medium">Şifrə sıfırlama linki göndərildi!</p>
                <p className="text-xs opacity-80">Zəhmət olmasa e-poçt qutunuzu yoxlayın.</p>
              </div>
              <Link to="/login" className="flex items-center justify-center w-full h-10 bg-white text-zinc-950 border border-zinc-200 hover:bg-zinc-50 rounded-lg shadow-none text-sm font-medium transition-all">
                Giriş səhifəsinə qayıt
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 block">E-poçt ünvanı</label>
                  <Input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="ad@numune.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-2">
                Linki göndər
              </Button>
              
              <p className="text-center text-sm text-zinc-500 mt-6">
                Xatırladınız?{' '}
                <Link to="/login" className="font-medium text-zinc-950 hover:underline underline-offset-4">
                  Geri qayıt
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
