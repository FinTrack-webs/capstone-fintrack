"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateValue(value: string) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function formatDateLabel(value: string) {
  const date = parseDateValue(value);
  if (!date) return "";

  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

export function DatePicker({ value, onChange, className, placeholder = "Pilih tanggal" }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [placement, setPlacement] = React.useState<"bottom" | "top">("bottom");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const selectedDate = React.useMemo(() => parseDateValue(value), [value]);
  const [visibleMonth, setVisibleMonth] = React.useState(() => {
    const baseDate = selectedDate ?? new Date();
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  });

  React.useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate]);

  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const firstDay = visibleMonth.getDay();
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const calendarDays = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  function moveMonth(offset: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function toggleOpen() {
    const rect = rootRef.current?.getBoundingClientRect();
    const calendarHeight = 300;

    if (rect && window.innerHeight - rect.bottom < calendarHeight && rect.top > calendarHeight) {
      setPlacement("top");
    } else {
      setPlacement("bottom");
    }

    setOpen((current) => !current);
  }

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <button
        type="button"
        onClick={toggleOpen}
        className={cn(
          "flex h-14 w-full min-w-0 items-center gap-3 rounded-full border border-outline-soft/40 bg-surface-low px-5 text-left text-sm font-semibold text-foreground outline-none transition hover:bg-surface-high focus:border-primary focus:ring-2 focus:ring-primary/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
          open && "border-primary ring-2 ring-primary/15",
        )}
        aria-expanded={open}
      >
        <CalendarDays className="h-5 w-5 shrink-0 text-outline" />
        <span className={cn("min-w-0 flex-1 truncate", !value && "text-foreground/55 dark:text-white/55")}>
          {value ? formatDateLabel(value) : placeholder}
        </span>
      </button>

      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 z-50 rounded-card border border-outline-soft/30 bg-surface-lowest p-3 shadow-lift dark:border-white/10 dark:bg-[#151b21]",
            placement === "top" ? "bottom-[calc(100%+.5rem)]" : "top-[calc(100%+.5rem)]",
          )}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full bg-surface-low text-primary transition hover:bg-surface-high dark:bg-white/10 dark:text-primary-soft dark:hover:bg-white/15"
              onClick={() => moveMonth(-1)}
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="truncate text-center font-display text-sm font-extrabold text-primary dark:text-primary-soft">
              {monthNames[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
            </p>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full bg-surface-low text-primary transition hover:bg-surface-high dark:bg-white/10 dark:text-primary-soft dark:hover:bg-white/15"
              onClick={() => moveMonth(1)}
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {dayNames.map((day) => (
              <span key={day} className="py-1 text-[11px] font-bold text-foreground/55 dark:text-white/55">
                {day}
              </span>
            ))}
            {calendarDays.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} />;

              const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
              const nextValue = toDateInputValue(date);
              const active = nextValue === value;

              return (
                <button
                  key={nextValue}
                  type="button"
                  onClick={() => {
                    onChange(nextValue);
                    setOpen(false);
                  }}
                  className={cn(
                    "grid aspect-square place-items-center rounded-full text-xs font-bold text-foreground transition hover:bg-surface-low dark:text-white dark:hover:bg-white/10",
                    active && "bg-secondary-soft text-secondary hover:bg-secondary-soft dark:bg-secondary-soft dark:text-secondary",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
