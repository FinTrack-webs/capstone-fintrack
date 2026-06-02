import type { LucideIcon } from "lucide-react";

export type TransactionType = "income" | "expense";
export type AccountType = "personal" | "business";
export type ApiTransactionType = "debit" | "kredit" | "transfer";
export type ClassificationStatus = "pending" | "classified" | "failed";

export type Transaction = {
  id: string;
  description: string;
  category: string;
  categoryId?: number | null;
  amount: number;
  date: string;
  type: TransactionType;
  accountType: AccountType;
  transactionType: ApiTransactionType;
  classificationStatus: ClassificationStatus;
  aiConfidence?: number | null;
  paymentMethod?: string;
  note?: string;
};

export type Category = {
  id: number;
  label: string;
  apiName: string;
  aiLabels?: string[];
  type: TransactionType;
  icon: LucideIcon;
  tone: "navy" | "mint" | "orange" | "soft";
};

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type ApiResponse<T> = {
  status: "success" | "error";
  message?: string;
  data: T;
  errors?: string[];
};

export type BackendTransaction = {
  id: string;
  user_id: string;
  category_id: number | null;
  amount: number;
  description: string;
  date: string;
  classification_status: ClassificationStatus;
  ai_confidence?: number | null;
  account_type: AccountType;
  transaction_type?: ApiTransactionType | null;
  created_at: string;
  category_name: string | null;
  category_type: TransactionType | null;
};

export type BackendCategory = {
  id: number;
  name: string;
  type: TransactionType;
  icon_url?: string | null;
  created_at?: string;
};

export type DashboardSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  breakdown: Array<{
    category_id: number;
    category_name: string;
    category_type: TransactionType;
    total_amount: string;
    transaction_count: string;
  }>;
};

export type ChartPoint = {
  month: string;
  pemasukan: number;
  pengeluaran: number;
};

export type UserProfile = {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  address?: string | null;
  avatar_url?: string | null;
  two_fa_enabled?: boolean;
  created_at?: string;
};

export type AiInsight = {
  type: "warning" | "tip" | "info";
  message: string;
  action_label?: string | null;
};

export type FinancialHealthScore = {
  score: number;
  total_income: number;
  total_expense: number;
};
