"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
};

export function Select({ value, options, onChange, className, placeholder = "Pilih" }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-14 w-full min-w-0 items-center justify-between gap-3 rounded-full border border-outline-soft/40 bg-surface-low px-5 text-left text-sm font-semibold text-foreground outline-none transition hover:bg-surface-high focus:border-primary focus:ring-2 focus:ring-primary/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
          open && "border-primary ring-2 ring-primary/15",
        )}
        aria-expanded={open}
      >
        <span className={cn("min-w-0 truncate", !selected && "text-foreground/55 dark:text-white/55")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-outline transition", open && "rotate-180 text-primary dark:text-primary-soft")} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+.5rem)] z-50 max-h-[45vh] overflow-y-auto rounded-card border border-outline-soft/30 bg-surface-lowest p-2 shadow-lift dark:border-white/10 dark:bg-[#151b21] sm:max-h-64">
          {options.map((option) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-full px-4 py-3 text-left text-sm font-semibold text-foreground transition hover:bg-surface-low dark:text-white dark:hover:bg-white/10",
                  active && "bg-secondary-soft text-secondary hover:bg-secondary-soft dark:bg-secondary-soft dark:text-secondary",
                )}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                {active && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
