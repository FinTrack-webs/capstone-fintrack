import {
  BriefcaseBusiness,
  Bus,
  Clapperboard,
  FileText,
  GraduationCap,
  HeartPulse,
  House,
  Lightbulb,
  Pizza,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import type { BackendCategory, BackendTransaction, Category, DashboardSummary, Transaction } from "@/types/finance";

const categoryIcons = {
  Gaji: WalletCards,
  Freelance: BriefcaseBusiness,
  "Kerja Lepas": BriefcaseBusiness,
  Investasi: TrendingUp,
  Bonus: Lightbulb,
  Makanan: Pizza,
  Transportasi: Bus,
  Utilitas: Smartphone,
  Belanja: ShoppingBag,
  Hiburan: Clapperboard,
  Kesehatan: HeartPulse,
  Pendidikan: GraduationCap,
  "Tempat Tinggal": House,
  Lainnya: FileText,
};

const aiLabelsByCategory: Record<string, string[]> = {
  Gaji: ["Gaji", "Gaji & Karyawan"],
  Freelance: ["Penjualan"],
  Investasi: ["Modal & Investasi"],
  Makanan: ["Makanan & Minuman"],
  Transportasi: ["Transportasi", "Transportasi & Logistik"],
  Utilitas: ["Pembayaran Langganan", "Pulsa & Internet", "Software & Langganan", "Operasional Kantor"],
  Belanja: ["Belanja Bulanan", "Pembelian Stok"],
  Hiburan: ["Hiburan"],
  "Tempat Tinggal": ["Tempat Tinggal"],
  Lainnya: ["Biaya Bank", "Marketing & Promosi", "Pajak & Perizinan", "Peralatan & Aset", "Piutang", "Utang & Cicilan", "Lain-lain"],
};

export const emptyDashboardSummary: DashboardSummary = {
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  breakdown: [],
};

export function toCategory(category: BackendCategory): Category {
  const Icon = categoryIcons[category.name as keyof typeof categoryIcons] ?? FileText;

  return {
    id: category.id,
    label: category.name === "Freelance" ? "Kerja Lepas" : category.name,
    apiName: category.name,
    aiLabels: aiLabelsByCategory[category.name],
    type: category.type,
    icon: Icon,
    tone: category.type === "income" ? "mint" : "soft",
  };
}

export function toTransaction(transaction: BackendTransaction): Transaction {
  const type = transaction.category_type ?? "expense";

  return {
    id: transaction.id,
    description: transaction.description,
    category: transaction.category_name ?? "Prediksi AI",
    categoryId: transaction.category_id,
    amount: Number(transaction.amount) || 0,
    date: String(transaction.date).split("T")[0],
    type,
    accountType: transaction.account_type ?? "personal",
    transactionType: transaction.transaction_type ?? (type === "income" ? "credit" : "debit"),
    classificationStatus: transaction.classification_status,
    aiConfidence: transaction.ai_confidence == null ? null : Number(transaction.ai_confidence),
  };
}
