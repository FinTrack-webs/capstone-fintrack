"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/utils/cn";

type Toast = {
  id: number;
  title: string;
  description?: string;
  variant?: "success" | "info";
};

type ToastContextValue = {
  toast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((nextToast: Omit<Toast, "id">) => {
    const id = Date.now();
    setToasts((current) => [...current, { ...nextToast, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[90] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((item) => {
          const Icon = item.variant === "info" ? Info : CheckCircle2;

          return (
            <div
              key={item.id}
              className={cn(
                "glass-panel flex items-start gap-3 rounded-card border border-white/50 p-4 shadow-lift",
                item.variant === "info" ? "text-primary" : "text-secondary",
              )}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-extrabold">{item.title}</p>
                {item.description ? <p className="mt-1 text-sm text-foreground/70 dark:text-white/70">{item.description}</p> : null}
              </div>
              <button
                aria-label="Tutup toast"
                className="rounded-full p-1 text-foreground/60 transition hover:bg-surface-high"
                onClick={() => setToasts((current) => current.filter((toast) => toast.id !== item.id))}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
