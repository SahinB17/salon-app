import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center p-10 text-center bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-sm border border-zinc-100 dark:border-zinc-800 mt-6 max-w-md mx-auto transition-colors"
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-700 blur-2xl opacity-50 rounded-full transform scale-150"></div>
        <div className="relative w-24 h-24 bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 rounded-full flex items-center justify-center shadow-inner border border-zinc-200/50 dark:border-zinc-700/50">
          <Icon className="w-10 h-10 text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
        </div>
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
    </motion.div>
  );
}
