import type { ReactNode } from 'react';
import { cn } from "../../lib/utils"
import { motion } from "framer-motion"
import type { HTMLMotionProps } from "framer-motion"

export interface PageWrapperProps extends HTMLMotionProps<"div"> {
  children: ReactNode
}

export function PageWrapper({ children, className, ...props }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn("w-full h-full", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
