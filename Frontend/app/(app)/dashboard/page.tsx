"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bot, CalendarCheck2, PlusCircle, Sparkles, WalletCards } from "lucide-react";
import { FinanceChart } from "@/components/finance-chart";
import { MetricCard } from "@/components/metric-card";
import { TransactionCard } from "@/components/transaction-card";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import type { ChartPoint, DashboardSummary, Transaction } from "@/types/finance";
import { fintrackApi, toChartData } from "@/utils/api";
import { emptyDashboardSummary, toTransaction } from "@/utils/data-mappers";
import { formatRupiah } from "@/utils/format";
import { CreditCard, PiggyBank, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>(emptyDashboardSummary);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const monthlyStats = [
    { label: "Saldo", value: dashboardSummary.balance, icon: PiggyBank, helper: "Saldo bersih bulan ini" },
    { label: "Pemasukan", value: dashboardSummary.totalIncome, icon: TrendingUp, helper: "Total pemasukan bulan ini" },
    { label: "Pengeluaran", value: dashboardSummary.totalExpense, icon: CreditCard, helper: "Total pengeluaran bulan ini" },
  ];

  useEffect(() => {
    Promise.all([fintrackApi.dashboard(), fintrackApi.transactions(new URLSearchParams({ limit: "4" })), fintrackApi.incomeVsExpense()])
      .then(([dashboardResponse, transactionResponse, chartResponse]) => {
        setDashboardSummary(dashboardResponse.data);
        setTransactions(transactionResponse.data.map(toTransaction));
        setChartData(toChartData(chartResponse.data));
      })
      .catch(() => {
        setDashboardSummary(emptyDashboardSummary);
        setTransactions([]);
        setChartData([]);
      });
  }, []);

  return (
    <div className="space-y-7">
      <section className="grid gap-7 lg:grid-cols-[1.1fr_.9fr]">
        <Card className="relative overflow-hidden bg-primary p-7 text-white dark:bg-primary">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-secondary-soft/20 blur-2xl" />
          <div className="relative">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-white/70">Yuk cek pengeluaran kamu hari ini</p>
                <h2 className="mt-2 break-words font-display text-3xl font-black sm:text-4xl">{formatRupiah(dashboardSummary.balance)}</h2>
              </div>
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/14">
                <WalletCards className="h-7 w-7" />
              </div>
            </div>
            <p className="max-w-md text-sm leading-6 text-white/74">
              Saldo bersih dari pemasukan dikurangi pengeluaran. Dompet kamu masih aman.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/tambah-transaksi">
                  <PlusCircle className="h-4 w-4 shrink-0" />
                  Tambah Transaksi
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="bg-secondary-soft/85 text-secondary">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/60">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-secondary">AI Insight</CardTitle>
              <CardText className="text-secondary/75">Pengeluaran minggu ini agak naik nih.</CardText>
            </div>
          </div>
          <p className="text-sm leading-6">
            Kalau transaksi baru belum punya kategori, AI bantu klasifikasi otomatis tanpa bikin kamu nunggu.
          </p>
          <Button asChild className="mt-6 bg-secondary text-white shadow-none hover:bg-secondary/90">
            <Link href="/ai-insight">
              <Bot className="h-4 w-4 shrink-0" />
              Lihat Saran AI
            </Link>
          </Button>
        </Card>
      </section>

      <section className="grid gap-7 md:grid-cols-3">
        {monthlyStats.map((item, index) => (
          <MetricCard key={item.label} {...item} featured={index === 0} />
        ))}
      </section>

      <section className="grid gap-7 lg:grid-cols-[1.35fr_.85fr]">
        <Card className="min-w-0 overflow-visible pb-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <CardTitle>Grafik Bulanan</CardTitle>
              <CardText>Mantap, pemasukan bulan ini naik.</CardText>
            </div>
            <CalendarCheck2 className="h-6 w-6 shrink-0 text-secondary" />
          </div>
          <FinanceChart data={chartData} />
        </Card>

        <Card className="min-w-0">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <CardTitle>Transaksi Baru</CardTitle>
              <CardText>Aktivitas terakhir kamu.</CardText>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/transaksi">Lihat</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 4).map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
