import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setShouldRender(false);
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* Sheet / Modal Content */}
      <div 
        className={cn(
          "relative bg-white w-full lg:w-auto lg:min-w-[500px] lg:max-w-xl transition-transform duration-300 transform lg:m-auto lg:rounded-3xl lg:shadow-xl lg:scale-100",
          isOpen ? "translate-y-0 opacity-100" : "translate-y-full lg:translate-y-0 lg:scale-95 lg:opacity-0",
          "rounded-t-[32px] px-4 lg:px-6 pt-6 lg:pt-8 pb-safe pb-8"
        )}
        onTransitionEnd={handleAnimationEnd}
      >
        {/* Mobile drag handle (hidden on desktop) */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-zinc-200 rounded-full lg:hidden" />
        
        <div className="flex items-center justify-between lg:mt-0 mt-4 mb-6">
          <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 active:bg-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="max-h-[70vh] overflow-y-auto scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
}
