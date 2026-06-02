"use client";

import { useEffect, useState } from "react";
import { Bot, CalendarDays, ChevronUp, Edit3, PiggyBank, Save, ShieldCheck, WalletCards } from "lucide-react";
import { motion } from "framer-motion";
import type { AccountType, ApiTransactionType, Category, TransactionType } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/utils/cn";
import {
  accountTypes,
  apiTransactionTypes,
  paymentMethodMap,
} from "@/constants/mock-data";
import { fintrackApi } from "@/utils/api";

type TransactionFormProps = {
  type: TransactionType;
  categories: Category[];
};

export function TransactionForm({ type, categories }: TransactionFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | "ai">("ai");
  const [accountType, setAccountType] = useState<AccountType>("personal");
  const [transactionType, setTransactionType] = useState<ApiTransactionType>(type === "income" ? "kredit" : "debit");
  const [paymentMethod, setPaymentMethod] = useState("BCA");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [prediction, setPrediction] = useState<{ predicted: string; mapped: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isIncome = type === "income";
  const selectedCategoryData = categories.find((category) => category.id === selectedCategory);
  const previewCategory = selectedCategoryData?.apiName ?? prediction?.predicted ?? "Menunggu deskripsi";
  const mappedCategory = selectedCategoryData?.label ?? prediction?.mapped ?? "Prediksi AI";

  useEffect(() => {
  setPaymentMethod(
    paymentMethodMap[transactionType]?.[0] ?? ""
  );
}, [transactionType]);

  useEffect(() => {
    if (selectedCategory !== "ai" || description.trim().length < 3) {
      setPrediction(null);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        const response = await fintrackApi.predictOnly({
          description,
          transaction_type: transactionType,
          account_type: accountType,
        });
        setPrediction({
          predicted: response.data.predicted_category,
          mapped: response.data.mapped_category,
        });
      } catch {
        setPrediction(null);
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, [accountType, description, selectedCategory, transactionType]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      await fintrackApi.createTransaction({
        category_id: selectedCategory === "ai" ? undefined : selectedCategory,
        amount: Number(amount),
        description,
        date,
        account_type: accountType,
        transaction_type: transactionType,
      });
      toast({
        title: isIncome ? "Pemasukan tersimpan" : "Pengeluaran tersimpan",
        description:
          selectedCategory === "ai"
            ? "Kategori dikosongkan, AI akan bantu klasifikasi."
            : `Kategori ${selectedCategoryData?.label} ikut disimpan.`,
      });
      setAmount("");
      setDescription("");
      setPrediction(null);
    } catch (error) {
      toast({
        title: "Gagal menyimpan",
        description: error instanceof Error ? error.message : "Backend belum mengembalikan transaksi.",
        variant: "info",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <p className="text-base text-foreground/76 dark:text-white/72">
        {isIncome
          ? "Mantap, pemasukan baru masuk nih. Catat biar arus kas makin kebaca!"
          : "Biar makin hemat, catat detailnya. Kalau kategori dikosongkan, AI bakal bantu nebak."}
      </p>

      <Card className="group relative overflow-hidden">
        <div className="absolute right-5 top-7 text-surface-highest transition group-hover:text-outline-soft/70">
          <WalletCards className="h-28 w-28" strokeWidth={1.8} />
        </div>
        <label className="block text-xs font-bold tracking-[0.05em] text-foreground/70 dark:text-white/70">
          {isIncome ? "Jumlah Pemasukan" : "Jumlah Pengeluaran"}
        </label>
        <div className="relative z-10 mt-3 flex items-baseline gap-2">
          <span className="font-display text-4xl font-black text-primary dark:text-primary-soft md:text-5xl">IDR</span>
          <input
            autoFocus
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))}
            placeholder="0"
            className="w-full min-w-0 bg-transparent p-0 font-display text-4xl font-black text-primary outline-none placeholder:text-outline-soft dark:text-primary-soft md:text-5xl"
          />
        </div>
      </Card>

      <div className="grid gap-7 lg:grid-cols-[1.05fr_.95fr]">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Pilih Kategori</CardTitle>
              <CardText className="mt-1">Bisa pilih manual, bisa juga biarin AI bantu isi kategori.</CardText>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategory("ai")}
              className={cn(
                "grid h-12 w-12 place-items-center rounded-full bg-secondary-soft text-secondary transition active:scale-95",
                selectedCategory === "ai" && "bg-primary text-white shadow-lift",
              )}
              aria-label="Pakai prediksi AI"
            >
              <Bot className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const active = selectedCategory === category.id;

              return (
                <motion.button
                  type="button"
                  key={category.label}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex aspect-square min-h-24 flex-col items-center justify-center rounded-card bg-surface-low p-3 text-center transition-all hover:bg-surface-high dark:bg-white/10 dark:hover:bg-white/15",
                    active && "scale-[1.03] bg-primary text-white shadow-lift hover:bg-primary",
                  )}
                >
                  <Icon className="mb-3 h-6 w-6" />
                  <span className="text-xs font-bold">{category.label}</span>
                </motion.button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-7">
          <Card>
          <CardTitle>Mode AI</CardTitle>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {accountTypes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setAccountType(item.value)}
                  className={cn(
                    "rounded-full bg-surface-low px-4 py-3 text-center text-sm font-bold transition dark:bg-white/10",
                    accountType === item.value && "bg-secondary-soft text-secondary shadow-soft",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-foreground/60 dark:text-white/60">
              {accountTypes.find((item) => item.value === accountType)?.helper}
            </p>
          </Card>

          <Card>
            <label className="mb-3 block text-xs font-bold tracking-[0.05em] text-foreground/70 dark:text-white/70">Tanggal Transaksi</label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
              <Input className="pl-14" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
          </Card>

          <Card>
            <label className="mb-3 block text-xs font-bold tracking-[0.05em] text-foreground/70 dark:text-white/70">
              Deskripsi Transaksi
            </label>
            <div className="relative">
              <Edit3 className="pointer-events-none absolute left-5 top-5 h-5 w-5 text-outline" />
              <Textarea
                className="pl-14"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={isIncome ? "Contoh: Pendapatan toko online" : "Contoh: Transport ke kantor"}
                required
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        <Card>
          <CardTitle>Tipe & Metode</CardTitle>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {apiTransactionTypes.map((item) => (
              <button
                type="button"
                key={item.value}
                onClick={() => setTransactionType(item.value)}
                className={cn(
                  "rounded-full bg-surface-low px-3 py-3 text-center text-xs font-bold transition dark:bg-white/10",
                  transactionType === item.value && "bg-primary text-white shadow-lift",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <select
  value={paymentMethod}
  onChange={(e) =>
    setPaymentMethod(e.target.value)
  }
  className="mt-4 h-14 w-full rounded-full border border-outline-soft/40 bg-surface-low"
>
  {paymentMethodMap[transactionType]?.map(
    (method) => (
      <option
        key={method}
        value={method}
      >
        {method}
      </option>
    )
  )}
</select>
        </Card>

        <Card className="bg-secondary-soft/75 text-secondary">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/70">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-secondary">Pratinjau AI</CardTitle>
              <p className="mt-2 text-sm leading-6 text-secondary/78">
                Mode {accountType === "business" ? "bisnis" : "pribadi"} dengan tipe {transactionType}. Contoh prediksi: {previewCategory}, lalu masuk ke{" "}
                <b>{mappedCategory}</b>.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading || !amount || !description.trim()}>
        <Save className="h-5 w-5" />
        {loading ? "Menyimpan..." : isIncome ? "Simpan Pemasukan" : "Simpan Pengeluaran"}
      </Button>

      <div className="grid gap-7 md:grid-cols-2">
        <div className="glass-panel flex items-center gap-4 rounded-card p-6 shadow-soft">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary-soft text-secondary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl">Aman & Terenkripsi</CardTitle>
            <CardText>Token akses dipakai sementara, token sesi buat masuk lagi dengan aman.</CardText>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-card bg-tertiary-soft/45 p-6 shadow-soft">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-tertiary-soft text-tertiary">
            {isIncome ? <PiggyBank className="h-6 w-6" /> : <ChevronUp className="h-6 w-6" />}
          </div>
          <div>
            <CardTitle className="text-xl text-tertiary">Tips Hari Ini</CardTitle>
            <CardText className="text-tertiary/80">
              {isIncome ? "Kalau kategori kosong, AI akan bantu isi setelah transaksi disimpan." : "Deskripsi makin jelas, tebakan AI biasanya makin cakep."}
            </CardText>
          </div>
        </div>
      </div>
    </form>
  );
}
