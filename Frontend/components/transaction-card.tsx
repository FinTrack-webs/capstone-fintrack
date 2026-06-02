import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import type { Transaction } from "@/types/finance";
import { formatRupiah } from "@/utils/format";
import { cn } from "@/utils/cn";

export function TransactionCard({
  transaction,
  onEdit,
  onDelete,
}: {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}) {
  const isIncome = transaction.type === "income";
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;
  const accountCopy = transaction.accountType === "business" ? "Bisnis" : "Pribadi";
  const statusCopy = {
    pending: "AI lagi nebak",
    classified: transaction.aiConfidence ? `AI ${Math.round(transaction.aiConfidence * 100)}%` : "AI beres",
    failed: "Perlu dicek",
  }[transaction.classificationStatus];

  return (
    <article className="flex items-center gap-3 rounded-card bg-surface-low p-4 transition hover:-translate-y-0.5 hover:bg-surface-high dark:bg-white/10 dark:hover:bg-white/15 sm:gap-4">
      <div
        className={cn(
          "grid h-12 w-12 shrink-0 place-items-center rounded-full",
          isIncome ? "bg-secondary-soft text-secondary" : "bg-tertiary-soft text-tertiary",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-display text-sm font-extrabold text-primary dark:text-primary-soft">{transaction.description}</h4>
        <p className="truncate text-xs text-foreground/60 dark:text-white/60">
          {transaction.category} - {accountCopy} - {statusCopy}
        </p>
      </div>
      <p className={cn("max-w-[42%] shrink-0 text-right font-display text-xs font-extrabold sm:text-sm", isIncome ? "text-secondary" : "text-primary dark:text-white")}>
        {isIncome ? "+" : "-"}
        {formatRupiah(transaction.amount)}
      </p>
      {(onEdit || onDelete) && (
        <div className="flex shrink-0 gap-1">
          {onEdit && (
            <button
              type="button"
              aria-label="Edit transaksi"
              onClick={() => onEdit(transaction)}
              className="grid h-9 w-9 place-items-center rounded-full text-primary transition hover:bg-surface-high dark:text-primary-soft dark:hover:bg-white/10"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              aria-label="Hapus transaksi"
              onClick={() => onDelete(transaction)}
              className="grid h-9 w-9 place-items-center rounded-full text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </article>
  );
}
