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
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 mt-6 max-w-md mx-auto transition-colors">
      <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-5 text-zinc-300 dark:text-zinc-600 transition-colors">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2 transition-colors">{title}</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 transition-colors">{description}</p>
      
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
