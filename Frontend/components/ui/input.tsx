import * as React from "react";
import { cn } from "@/utils/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-14 w-full rounded-full border border-outline-soft/40 bg-surface-low px-5 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:bg-white/10 dark:text-white",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full resize-none rounded-card border border-outline-soft/40 bg-surface-low px-5 py-4 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:bg-white/10 dark:text-white",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
