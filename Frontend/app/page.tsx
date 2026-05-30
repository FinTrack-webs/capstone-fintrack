import Link from "next/link";
import { BarChart3, Bot, CheckCircle2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-gradient-to-br from-[#f8fffc] via-[#eef7f3] to-[#f3f7ff] text-foreground overflow-hidden">
      <div className="absolute left-[-200px] top-[120px] h-[200px] w-[300px] rounded-full bg-green-200/40 blur-3xl" />
       <div className="absolute left-[-200px] top-[120px] h-[200px] w-[300px] rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute right-[-100px] top-[200px] h-[320px] w-[320px] rounded-full bg-blue-200/40 blur-3xl" />
      <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center">
       <Image
          src="/logo.png"
           alt="FinTrack"
           width={170}
           height={50}
           priority
          className="h-auto w-[170px]"
        />
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Masuk</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Daftar</Link>
          </Button>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100dvh-5rem)] max-w-6xl items-center gap-10 px-5 pb-14 pt-4 lg:grid-cols-[.92fr_1.08fr]">
        <div>
          <h1 className="font-display text-5xl font-black leading-[1.04] text-primary dark:text-primary-soft md:text-6xl">
            Kelola Finansial Tanpa Batas
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-foreground/72 dark:text-white/72">
            Bikin transaksi dan analisis keuangan UMKM jadi lebih mudah, cepat, dan tanpa ribet.
          </p>
        </div>
        <div className="relative">
          <div className="absolute -inset-3 rounded-card-lg bg-secondary-soft/35 blur-3xl" />
          <div className="relative overflow-hidden rounded-card-lg border border-white/60 bg-surface-lowest p-5 shadow-lift dark:border-white/10 dark:bg-white/[0.06]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-display text-2xl font-black text-primary dark:text-primary-soft sm:text-3xl">Kelola uang lebih rapi</p>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-white">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="rounded-card bg-secondary-soft/80 p-5 text-secondary shadow-none">
                <CardTitle className="text-secondary">Pemasukan</CardTitle>
                <CardText className="mt-2 text-secondary/75">Pantau alur masuk tanpa ribet.</CardText>
              </Card>
              <Card className="rounded-card bg-surface-low p-5 shadow-none dark:bg-white/10">
                <CardTitle>Pengeluaran</CardTitle>
                <CardText className="mt-2">Biar belanja harian tetap kebaca.</CardText>
              </Card>
            </div>
            <div className="mt-5 rounded-card bg-primary p-5 text-white">
              <div className="mb-4 flex items-center gap-3">
                <Bot className="h-6 w-6" />
                <p className="font-display text-lg font-black">AI Insight</p>
              </div>
              <p className="text-sm leading-6 text-white/78">
                Pratinjau kategori dulu, lalu simpan transaksi dan biarkan AI bantu merapikan.
              </p>
            </div>
            <div className="mt-5 space-y-3">
              {["Transaksi otomatis rapi", "Kategori dibantu AI", "Laporan siap dibaca"].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-card bg-surface-low px-4 py-3 dark:bg-white/10 sm:rounded-full">
                  <CheckCircle2 className={index === 1 ? "h-5 w-5 text-secondary" : "h-5 w-5 text-primary dark:text-primary-soft"} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{item}</span>
                  <CreditCard className="h-4 w-4 shrink-0 text-outline" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
