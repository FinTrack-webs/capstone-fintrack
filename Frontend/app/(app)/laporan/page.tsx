"use client";

import { useEffect, useState } from "react";
import { Download, TrendingDown, TrendingUp } from "lucide-react";
import { FinanceChart } from "@/components/finance-chart";
import { MetricCard } from "@/components/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import type { ChartPoint, DashboardSummary, ExpenseDistribution, Transaction } from "@/types/finance";
import { fintrackApi, toChartData } from "@/utils/api";
import { emptyDashboardSummary, toTransaction } from "@/utils/data-mappers";
import { formatRupiah } from "@/utils/format";
import { CreditCard, PiggyBank } from "lucide-react";

type ReportPeriod = "this-month" | "last-3-months" | "custom";
type MonthlyExpense = { month: string; total_expense?: number; total?: number };

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDefaultRange(period: ReportPeriod) {
  const now = new Date();

  if (period === "last-3-months") {
    return {
      start: toDateInputValue(new Date(now.getFullYear(), now.getMonth() - 2, 1)),
      end: toDateInputValue(now),
    };
  }

  return {
    start: toDateInputValue(new Date(now.getFullYear(), now.getMonth(), 1)),
    end: toDateInputValue(now),
  };
}

function formatDateLabel(value: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function buildSummaryFromTransactions(transactions: Transaction[]) {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const totalExpense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}

function buildCategoryRows(transactions: Transaction[]) {
  const grouped = new Map<string, { type: string; total: number; count: number }>();

  transactions.forEach((transaction) => {
    const current = grouped.get(transaction.category) ?? {
      type: transaction.type === "income" ? "Pemasukan" : "Pengeluaran",
      total: 0,
      count: 0,
    };
    current.total += transaction.amount;
    current.count += 1;
    grouped.set(transaction.category, current);
  });

  return Array.from(grouped.entries())
    .map(([category, row]) => ({ category, ...row }))
    .sort((left, right) => right.total - left.total);
}

function getLastAutoTableY(doc: unknown) {
  return (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 0;
}

function getMonthlyExpenseTotal(row?: MonthlyExpense) {
  if (!row) return 0;

  return Number(row.total_expense ?? row.total ?? 0);
}

export default function LaporanPage() {
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>(emptyDashboardSummary);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [expenseDistribution, setExpenseDistribution] = useState<ExpenseDistribution[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([]);
  const [openPdfModal, setOpenPdfModal] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("this-month");
  const [customStartDate, setCustomStartDate] = useState(getDefaultRange("this-month").start);
  const [customEndDate, setCustomEndDate] = useState(getDefaultRange("this-month").end);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const { toast } = useToast();
  const monthlyStats = [
    { label: "Saldo", value: dashboardSummary.balance, icon: PiggyBank, helper: "Saldo bersih bulan ini" },
    { label: "Pemasukan", value: dashboardSummary.totalIncome, icon: TrendingUp, helper: "Total pemasukan bulan ini" },
    { label: "Pengeluaran", value: dashboardSummary.totalExpense, icon: CreditCard, helper: "Total pengeluaran bulan ini" },
  ];
  const selectedRange =
    reportPeriod === "custom" ? { start: customStartDate, end: customEndDate } : getDefaultRange(reportPeriod);
  const periodOptions = [
    { value: "this-month", label: "Bulan ini" },
    { value: "last-3-months", label: "3 bulan terakhir" },
    { value: "custom", label: "Tanggal custom" },
  ];
  const latestMonthlyExpense = monthlyExpenses.at(-1);
  const topExpenseCategory = expenseDistribution[0];

  useEffect(() => {
    Promise.all([fintrackApi.dashboard(), fintrackApi.incomeVsExpense(), fintrackApi.expenseDistribution(), fintrackApi.monthlyExpenses()])
      .then(([dashboardResponse, chartResponse, distributionResponse, monthlyExpenseResponse]) => {
        setDashboardSummary(dashboardResponse.data);
        setChartData(toChartData(chartResponse.data));
        setExpenseDistribution(distributionResponse.data);
        setMonthlyExpenses(monthlyExpenseResponse.data);
      })
      .catch(() => {
        setDashboardSummary(emptyDashboardSummary);
        setChartData([]);
        setExpenseDistribution([]);
        setMonthlyExpenses([]);
      });
  }, []);

  async function handleGeneratePdf() {
    if (!selectedRange.start || !selectedRange.end) {
      toast({
        title: "Tanggal belum lengkap",
        description: "Pilih tanggal mulai dan akhir dulu biar laporan PDF rapi.",
        variant: "info",
      });
      return;
    }

    setPdfLoading(true);

    try {
      const transactionParams = new URLSearchParams({
        limit: "100",
        start_date: selectedRange.start,
        end_date: selectedRange.end,
      });
      const chartParams = new URLSearchParams({
        period: "monthly",
        start_date: selectedRange.start,
        end_date: selectedRange.end,
      });
      const [{ jsPDF }, { autoTable }, transactionResponse, chartResponse] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
        fintrackApi.transactions(transactionParams),
        fintrackApi.incomeVsExpense(chartParams),
      ]);
      const transactions = transactionResponse.data.map(toTransaction);
      const summary = buildSummaryFromTransactions(transactions);
      const categoryRows = buildCategoryRows(transactions);
      const cashflowRows = toChartData(chartResponse.data);
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const generatedAt = new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date());

      doc.setFillColor(0, 32, 69);
      doc.rect(0, 0, pageWidth, 38, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("Laporan Keuangan FinTrack", 14, 17);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Periode: ${formatDateLabel(selectedRange.start)} - ${formatDateLabel(selectedRange.end)}`, 14, 25);
      doc.text(`Dibuat: ${generatedAt}`, 14, 31);

      autoTable(doc, {
        startY: 46,
        head: [["Ringkasan", "Nominal"]],
        body: [
          ["Saldo", formatRupiah(summary.balance)],
          ["Pemasukan", formatRupiah(summary.totalIncome)],
          ["Pengeluaran", formatRupiah(summary.totalExpense)],
          ["Jumlah transaksi", String(transactions.length)],
        ],
        styles: { font: "helvetica", fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [27, 107, 81], textColor: 255 },
        alternateRowStyles: { fillColor: [246, 248, 250] },
      });

      autoTable(doc, {
        startY: getLastAutoTableY(doc) ? getLastAutoTableY(doc) + 8 : 86,
        head: [["Bulan", "Pemasukan", "Pengeluaran"]],
        body: cashflowRows.map((row) => [
          row.month,
          formatRupiah(row.pemasukan),
          formatRupiah(row.pengeluaran),
        ]),
        styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [0, 32, 69], textColor: 255 },
        alternateRowStyles: { fillColor: [246, 248, 250] },
      });

      autoTable(doc, {
        startY: getLastAutoTableY(doc) + 8,
        head: [["Kategori", "Tipe", "Transaksi", "Total"]],
        body: categoryRows.map((row) => [
          row.category,
          row.type,
          String(row.count),
          formatRupiah(row.total),
        ]),
        styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [27, 107, 81], textColor: 255 },
        alternateRowStyles: { fillColor: [246, 248, 250] },
      });

      autoTable(doc, {
        startY: getLastAutoTableY(doc) + 8,
        head: [["Tanggal", "Deskripsi", "Kategori", "Tipe", "Nominal"]],
        body: transactions.slice(0, 30).map((transaction) => [
          formatDateLabel(transaction.date),
          transaction.description,
          transaction.category,
          transaction.type === "income" ? "Pemasukan" : "Pengeluaran",
          `${transaction.type === "income" ? "+" : "-"}${formatRupiah(transaction.amount)}`,
        ]),
        styles: { font: "helvetica", fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [0, 32, 69], textColor: 255 },
        alternateRowStyles: { fillColor: [246, 248, 250] },
      });

      doc.save(`laporan-fintrack-${selectedRange.start}-${selectedRange.end}.pdf`);
      setOpenPdfModal(false);
      toast({
        title: "PDF berhasil dibuat",
        description: "Laporan keuangan sudah siap dibaca.",
      });
    } catch (error) {
      toast({
        title: "Gagal membuat PDF",
        description: error instanceof Error ? error.message : "Data laporan belum bisa diunduh.",
        variant: "info",
      });
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleExportCsv() {
    if (!selectedRange.start || !selectedRange.end) {
      toast({
        title: "Tanggal belum lengkap",
        description: "Pilih tanggal mulai dan akhir dulu sebelum export CSV.",
        variant: "info",
      });
      return;
    }

    setCsvLoading(true);

    try {
      const params = new URLSearchParams({
        start_date: selectedRange.start,
        end_date: selectedRange.end,
      });
      const blob = await fintrackApi.exportTransactions(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `transaksi-fintrack-${selectedRange.start}-${selectedRange.end}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setOpenPdfModal(false);
      toast({ title: "CSV berhasil diunduh", description: "Data transaksi dari backend sudah siap." });
    } catch (error) {
      toast({
        title: "Gagal mengunduh CSV",
        description: error instanceof Error ? error.message : "Export transaksi belum bisa diproses.",
        variant: "info",
      });
    } finally {
      setCsvLoading(false);
    }
  }

  return (
    <div className="space-y-7">
      <Card className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Laporan Keuangan</CardTitle>
          <CardText className="mt-1">Ringkasan Mei 2026, biar bisnis dan dompet pribadi tetap kebaca.</CardText>
        </div>
        <Button onClick={() => setOpenPdfModal(true)}>
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
          <CardText className="mt-2">
            {topExpenseCategory
              ? `${topExpenseCategory.category_name} jadi kategori pengeluaran terbesar dengan porsi ${topExpenseCategory.percentage}%.`
              : "Pemasukan dan pengeluaran akan terlihat lebih jelas setelah transaksi bertambah."}
          </CardText>
        </Card>
        <Card>
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-tertiary-soft text-tertiary">
            <TrendingDown className="h-6 w-6" />
          </div>
          <CardTitle>Yang perlu direm</CardTitle>
          <CardText className="mt-2">
            {latestMonthlyExpense
              ? `Pengeluaran ${latestMonthlyExpense.month} tercatat ${formatRupiah(getMonthlyExpenseTotal(latestMonthlyExpense))}. Pantau ritmenya sebelum kebablasan.`
              : "Belum ada data pengeluaran bulanan dari backend untuk ditampilkan."}
          </CardText>
        </Card>
      </div>

      <Card>
        <CardTitle>Distribusi Pengeluaran</CardTitle>
        <CardText className="mt-1">Kategori pengeluaran yang paling besar porsinya.</CardText>
        <div className="mt-5 space-y-3">
          {expenseDistribution.slice(0, 5).map((item) => (
            <div key={item.category_name} className="rounded-card bg-surface-low p-4 dark:bg-white/10">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-display text-sm font-extrabold text-primary dark:text-primary-soft">{item.category_name}</p>
                <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-bold text-secondary">{item.percentage}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-high dark:bg-white/10">
                <div className="h-full rounded-full bg-secondary" style={{ width: `${item.percentage}%` }} />
              </div>
              <CardText className="mt-2">{formatRupiah(Number(item.total))}</CardText>
            </div>
          ))}
          {expenseDistribution.length === 0 && <CardText>Belum ada distribusi pengeluaran untuk ditampilkan.</CardText>}
        </div>
      </Card>

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

      <Modal open={openPdfModal} title="Unduh PDF" onClose={() => setOpenPdfModal(false)}>
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold tracking-[0.05em] text-foreground/70 dark:text-white/70">Periode Laporan</label>
            <Select
              value={reportPeriod}
              options={periodOptions}
              onChange={(nextValue) => setReportPeriod(nextValue as ReportPeriod)}
            />
          </div>
          {reportPeriod === "custom" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <DatePicker value={customStartDate} onChange={setCustomStartDate} placeholder="Tanggal mulai" />
              <DatePicker value={customEndDate} onChange={setCustomEndDate} placeholder="Tanggal akhir" />
            </div>
          )}
          <Button className="w-full" onClick={handleGeneratePdf} disabled={pdfLoading}>
            <Download className="h-4 w-4" />
            {pdfLoading ? "Membuat PDF..." : "Buat PDF"}
          </Button>
          <Button className="w-full" variant="outline" onClick={handleExportCsv} disabled={csvLoading}>
            <Download className="h-4 w-4" />
            {csvLoading ? "Mengunduh CSV..." : "Unduh CSV"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
