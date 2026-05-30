"use client";

import { useEffect, useState } from "react";
import { Download, TrendingDown, TrendingUp } from "lucide-react";
import { FinanceChart } from "@/components/finance-chart";
import { MetricCard } from "@/components/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import type { ChartPoint, DashboardSummary } from "@/types/finance";
import { fintrackApi, toChartData } from "@/utils/api";
import { emptyDashboardSummary } from "@/utils/data-mappers";
import { formatRupiah } from "@/utils/format";
import { CreditCard, PiggyBank } from "lucide-react";

export default function LaporanPage() {
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>(emptyDashboardSummary);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const monthlyStats = [
    { label: "Saldo", value: dashboardSummary.balance, icon: PiggyBank, helper: "Saldo bersih bulan ini" },
    { label: "Pemasukan", value: dashboardSummary.totalIncome, icon: TrendingUp, helper: "Total pemasukan bulan ini" },
    { label: "Pengeluaran", value: dashboardSummary.totalExpense, icon: CreditCard, helper: "Total pengeluaran bulan ini" },
  ];

  useEffect(() => {
    Promise.all([fintrackApi.dashboard(), fintrackApi.incomeVsExpense()])
      .then(([dashboardResponse, chartResponse]) => {
        setDashboardSummary(dashboardResponse.data);
        setChartData(toChartData(chartResponse.data));
      })
      .catch(() => {
        setDashboardSummary(emptyDashboardSummary);
        setChartData([]);
      });
  }, []);

  return (
    <div className="space-y-7">
      <Card className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Laporan Keuangan</CardTitle>
          <CardText className="mt-1">Ringkasan Mei 2026, biar bisnis dan dompet pribadi tetap kebaca.</CardText>
        </div>
        <Button>
          <Download className="h-4 w-4" />
          Unduh PDF
        </Button>
      </Card>

      <div className="grid gap-7 md:grid-cols-3">
        {monthlyStats.map((item, index) => (
          <MetricCard key={item.label} {...item} featured={index === 0} />
        ))}
      </div>

      <Card>
        <CardTitle>Arus Kas</CardTitle>
        <CardText className="mt-1">Pemasukan vs pengeluaran dari Januari sampai Juni.</CardText>
        <div className="mt-5">
          <FinanceChart data={chartData} />
        </div>
      </Card>

      <div className="grid gap-7 md:grid-cols-2">
        <Card>
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-secondary-soft text-secondary">
            <TrendingUp className="h-6 w-6" />
          </div>
          <CardTitle>Kategori paling sehat</CardTitle>
          <CardText className="mt-2">Pemasukan bisnis naik 18%. Mantap, invoice lancar terus.</CardText>
        </Card>
        <Card>
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-tertiary-soft text-tertiary">
            <TrendingDown className="h-6 w-6" />
          </div>
          <CardTitle>Yang perlu direm</CardTitle>
          <CardText className="mt-2">Jajan dan transportasi naik {formatRupiah(420000)}. Masih aman, tapi jangan kebablasan.</CardText>
        </Card>
      </div>

      <Card>
        <CardTitle>Rincian Kategori</CardTitle>
        <CardText className="mt-1">Ringkasan kategori yang paling banyak bergerak bulan ini.</CardText>
        <div className="mt-5 space-y-3">
          {dashboardSummary.breakdown.map((item) => (
            <div key={`${item.category_id}-${item.category_name}`} className="flex items-center justify-between gap-4 rounded-card bg-surface-low px-5 py-3 dark:bg-white/10 sm:rounded-full">
              <div className="min-w-0">
                <p className="font-display text-sm font-extrabold text-primary dark:text-primary-soft">{item.category_name}</p>
                <p className="text-xs text-foreground/60 dark:text-white/60">
                  {item.category_type === "income" ? "Pemasukan" : "Pengeluaran"} - {item.transaction_count} transaksi
                </p>
              </div>
              <p className="shrink-0 text-right font-display text-sm font-extrabold">{formatRupiah(Number(item.total_amount))}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
