import React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 active:scale-[0.98] h-10 py-2 px-4 shadow-sm",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
