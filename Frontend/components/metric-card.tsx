import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/utils/format";
import { cn } from "@/utils/cn";

type MetricCardProps = {
  label: string;
  value: number;
  helper: string;
  icon: LucideIcon;
  featured?: boolean;
};

export function MetricCard({ label, value, helper, icon: Icon, featured }: MetricCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", featured && "bg-primary text-white dark:bg-primary")}>
      <div
        className={cn(
          "mb-5 grid h-12 w-12 place-items-center rounded-full",
          featured ? "bg-white/15 text-white" : "bg-secondary-soft text-secondary",
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <p className={cn("text-sm font-semibold", featured ? "text-white/70" : "text-foreground/60 dark:text-white/60")}>{label}</p>
      <p className={cn("mt-1 break-words font-display text-2xl font-black sm:text-3xl", featured ? "text-white" : "text-primary dark:text-primary-soft")}>
        {formatRupiah(value)}
      </p>
      <p className={cn("mt-3 text-sm", featured ? "text-white/78" : "text-foreground/64 dark:text-white/64")}>{helper}</p>
    </Card>
  );
}
