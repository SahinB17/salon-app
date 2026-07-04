import React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg border bg-white dark:bg-zinc-900 px-4 py-3 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50",
          error 
            ? "border-red-500 focus:ring-red-500 text-red-900 dark:text-red-400" 
            : "border-zinc-200 dark:border-zinc-800 focus:ring-zinc-950 dark:focus:ring-zinc-700",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
