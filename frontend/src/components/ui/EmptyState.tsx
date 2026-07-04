import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  buttonText, 
  buttonLink 
}: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl shadow-sm border border-zinc-100 mt-6 max-w-md mx-auto">
      <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-5 text-zinc-300">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-zinc-900 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 mb-6">{description}</p>
      
      {buttonText && buttonLink && (
        <Button 
          onClick={() => navigate(buttonLink)}
          className="rounded-full px-6"
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
}
