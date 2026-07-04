import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-zinc-100 text-zinc-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
