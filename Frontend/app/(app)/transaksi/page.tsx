"use client";

import { useEffect, useState } from "react";
import { Filter, Save, Search, Trash2 } from "lucide-react";
import { TransactionCard } from "@/components/transaction-card";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import type { AccountType, ApiTransactionType, Category, ClassificationStatus, Transaction, TransactionType } from "@/types/finance";
import { fintrackApi } from "@/utils/api";
import { toCategory, toTransaction } from "@/utils/data-mappers";

export default function TransaksiPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ClassificationStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("ai");
  const [editAccountType, setEditAccountType] = useState<AccountType>("personal");
  const [editTransactionType, setEditTransactionType] = useState<ApiTransactionType>("debit");
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fintrackApi
      .categories()
      .then((response) => setCategories(response.data.map(toCategory)))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ limit: "100" });
    if (search.trim()) params.set("search", search.trim());
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (categoryFilter !== "all") params.set("category_id", categoryFilter);
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);

    const timer = window.setTimeout(() => {
      fintrackApi
        .transactions(params)
        .then((response) => setTransactions(response.data.map(toTransaction)))
        .catch(() => setTransactions([]));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [categoryFilter, endDate, search, startDate, statusFilter, typeFilter]);

  const hasActiveFilter =
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    Boolean(startDate) ||
    Boolean(endDate);
  const typeOptions = [
    { value: "all", label: "Semua tipe" },
    { value: "income", label: "Pemasukan" },
    { value: "expense", label: "Pengeluaran" },
  ];
  const categoryOptions = [
    { value: "all", label: "Semua kategori" },
    ...categories.map((category) => ({ value: String(category.id), label: category.label })),
  ];
  const statusOptions = [
    { value: "all", label: "Semua status" },
    { value: "pending", label: "Pending" },
    { value: "classified", label: "Classified" },
    { value: "failed", label: "Failed" },
  ];
  const editCategoryOptions = [
    { value: "ai", label: "Prediksi AI" },
    ...categories.map((category) => ({ value: String(category.id), label: category.label })),
  ];
  const accountOptions = [
    { value: "personal", label: "Pribadi" },
    { value: "business", label: "Bisnis" },
  ];
  const transactionTypeOptions = [
    { value: "debit", label: "Debit" },
    { value: "credit", label: "Kredit" },
  ];

  function resetFilters() {
    setTypeFilter("all");
    setStatusFilter("all");
    setCategoryFilter("all");
    setStartDate("");
    setEndDate("");
  }

  function openEdit(transaction: Transaction) {
    setEditing(transaction);
    setEditAmount(String(transaction.amount));
    setEditDescription(transaction.description);
    setEditDate(transaction.date);
    setEditCategoryId(transaction.categoryId ? String(transaction.categoryId) : "ai");
    setEditAccountType(transaction.accountType);
    setEditTransactionType(transaction.transactionType);
  }

  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    setActionLoading(true);
    try {
      const response = await fintrackApi.updateTransaction(editing.id, {
        category_id: editCategoryId === "ai" ? undefined : Number(editCategoryId),
        amount: Number(editAmount),
        description: editDescription,
        date: editDate,
        account_type: editAccountType,
        transaction_type: editTransactionType,
      });
      setTransactions((current) => current.map((item) => (item.id === editing.id ? toTransaction(response.data) : item)));
      setEditing(null);
      toast({ title: "Transaksi diperbarui", description: "Riwayat kamu sudah ikut rapi." });
    } catch (error) {
      toast({
        title: "Gagal update transaksi",
        description: error instanceof Error ? error.message : "Backend belum menerima perubahan transaksi.",
        variant: "info",
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;

    setActionLoading(true);
    try {
      await fintrackApi.deleteTransaction(deleting.id);
      setTransactions((current) => current.filter((item) => item.id !== deleting.id));
      setDeleting(null);
      toast({ title: "Transaksi dihapus", description: "Data sudah dihapus dari riwayat." });
    } catch (error) {
      toast({
        title: "Gagal hapus transaksi",
        description: error instanceof Error ? error.message : "Backend belum menghapus transaksi.",
        variant: "info",
      });
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-7">
      <Card>
        <CardTitle>Riwayat duit kamu</CardTitle>
        <CardText className="mt-1">Cari transaksi, cek mode akun, dan pantau status klasifikasi AI.</CardText>
        <div className="mt-5 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
            <Input className="pl-14" placeholder="Cari transaksi..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <Button
            size="icon"
            variant={hasActiveFilter ? "default" : "outline"}
            aria-label="Filter transaksi"
            onClick={() => setShowFilters((current) => !current)}
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>
        {showFilters && (
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Select
              value={typeFilter}
              options={typeOptions}
              onChange={(nextValue) => setTypeFilter(nextValue as "all" | TransactionType)}
            />
            <Select
              value={categoryFilter}
              options={categoryOptions}
              onChange={setCategoryFilter}
            />
            <Select
              value={statusFilter}
              options={statusOptions}
              onChange={(nextValue) => setStatusFilter(nextValue as "all" | ClassificationStatus)}
            />
            <DatePicker value={startDate} onChange={setStartDate} placeholder="Tanggal mulai" />
            <DatePicker value={endDate} onChange={setEndDate} placeholder="Tanggal akhir" />
            <Button type="button" variant="outline" onClick={resetFilters} disabled={!hasActiveFilter}>
              Reset Filter
            </Button>
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-5 flex items-center justify-between gap-3">
          <CardTitle>Mei 2026</CardTitle>
          <span className="rounded-full bg-secondary-soft px-4 py-2 text-xs font-bold text-secondary">{transactions.length} transaksi</span>
        </div>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} onEdit={openEdit} onDelete={setDeleting} />
          ))}
        </div>
      </Card>

      <Modal open={Boolean(editing)} title="Edit Transaksi" onClose={() => setEditing(null)}>
        <form className="space-y-4" onSubmit={saveEdit}>
          <Input value={editAmount} inputMode="numeric" onChange={(event) => setEditAmount(event.target.value.replace(/\D/g, ""))} placeholder="Jumlah" required />
          <Textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} placeholder="Deskripsi" required />
          <DatePicker value={editDate} onChange={setEditDate} placeholder="Tanggal transaksi" />
          <Select value={editCategoryId} options={editCategoryOptions} onChange={setEditCategoryId} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Select value={editAccountType} options={accountOptions} onChange={(value) => setEditAccountType(value as AccountType)} />
            <Select value={editTransactionType} options={transactionTypeOptions} onChange={(value) => setEditTransactionType(value as ApiTransactionType)} />
          </div>
          <Button className="w-full" disabled={actionLoading || !editAmount || !editDescription.trim()}>
            <Save className="h-4 w-4" />
            {actionLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </form>
      </Modal>

      <Modal open={Boolean(deleting)} title="Hapus Transaksi" onClose={() => setDeleting(null)}>
        <CardText>Transaksi ini akan dihapus permanen dari riwayat.</CardText>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button type="button" variant="outline" onClick={() => setDeleting(null)}>
            Batal
          </Button>
          <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={confirmDelete} disabled={actionLoading}>
            <Trash2 className="h-4 w-4" />
            {actionLoading ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
