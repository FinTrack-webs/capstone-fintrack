import {
  BarChart3,
  Bot,
  Home,
  PlusCircle,
  ReceiptText,
  Target,
  UserRound,
} from "lucide-react";
import type { AccountType, ApiTransactionType, NavItem } from "@/types/finance";

export const navItems: NavItem[] = [
  { label: "Beranda", href: "/dashboard", icon: Home },
  { label: "Riwayat", href: "/transaksi", icon: ReceiptText },
  { label: "Tambah", href: "/tambah-transaksi", icon: PlusCircle },
  { label: "Target", href: "/target-tabungan", icon: Target },
  { label: "Insight", href: "/ai-insight", icon: Bot },
  { label: "Akun", href: "/profil", icon: UserRound },
];

export const sidebarItems: NavItem[] = [
  ...navItems.filter((item) => item.label !== "Akun"),
  { label: "Laporan", href: "/laporan", icon: BarChart3 },
  { label: "Akun", href: "/profil", icon: UserRound },
];

export const accountTypes: Array<{ value: AccountType; label: string; helper: string }> = [
  { value: "personal", label: "Pribadi", helper: "Model AI: 9 kategori harian" },
  { value: "business", label: "Bisnis", helper: "Model AI: 14 kategori UMKM" },
];

export const apiTransactionTypes: Array<{ value: ApiTransactionType; label: string }> = [
  { value: "debit", label: "Debit" },
  { value: "credit", label: "Kredit" },
];

export const paymentMethodMap = {
  debit: [
    "BCA",
    "BNI",
    "BRI",
    "Mandiri",
  ],

  credit: [
    "Visa",
    "Mastercard",
  ],
};

export const personalAiLabels = [
  "Belanja Bulanan",
  "Gaji",
  "Hiburan",
  "Makanan & Minuman",
  "Pembayaran Langganan",
  "Pulsa & Internet",
  "Tempat Tinggal",
  "Transfer Teman/Keluarga",
  "Transportasi",
];

export const businessAiLabels = [
  "Biaya Bank",
  "Gaji & Karyawan",
  "Lain-lain",
  "Marketing & Promosi",
  "Modal & Investasi",
  "Operasional Kantor",
  "Pajak & Perizinan",
  "Pembelian Stok",
  "Penjualan",
  "Peralatan & Aset",
  "Piutang",
  "Software & Langganan",
  "Transportasi & Logistik",
  "Utang & Cicilan",
];
