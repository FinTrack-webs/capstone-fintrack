"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { navItems, sidebarItems } from "@/constants/mock-data";
import { cn } from "@/utils/cn";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { fintrackApi, getStoredAuth } from "@/utils/api";

const titleByPath: Record<string, string> = {
  "/dashboard": "Beranda",
  "/tambah-pengeluaran": "Catat Pengeluaran",
  "/tambah-pemasukan": "Catat Pemasukan",
  "/transaksi": "Riwayat Transaksi",
  "/laporan": "Laporan Keuangan",
  "/ai-insight": "AI Insight",
  "/profil": "Akun Kamu",
  "/profil/edit": "Edit Profil",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const title = titleByPath[pathname] ?? "fintrack";
  const [profileName, setProfileName] = useState("FinTrack");

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }

    setProfileName(auth.user.email);
    fintrackApi
      .profile()
      .then((response) => setProfileName(response.data.full_name || response.data.email))
      .catch(() => setProfileName(auth.user.email));
  }, [router]);

  return (
    <div className="min-h-dvh bg-background pb-28 text-foreground dark:bg-[#101418]">
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col overflow-hidden rounded-r-card bg-surface-low px-3 py-10 shadow-soft dark:bg-white/[0.06] md:flex">

  <div className="pointer-events-none absolute -left-24 -top-16 h-72 w-72 rounded-full bg-[#8ee7c3]/25 blur-3xl" />

<div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[#8ee7c3]/20 blur-3xl" />

<div className="pointer-events-none absolute -right-24 bottom-20 h-72 w-72 rounded-full bg-[#c8d8ff]/25 blur-3xl" />

  {/* isi sidebar */}
        <div className="flex min-w-0 items-center gap-3">
  <button
    aria-label="Kembali"
    className="grid h-10 w-10 place-items-center rounded-full"
    onClick={() => router.back()}
  >
    <ArrowLeft className="h-5 w-5" />
  </button>

  <Image
    src="/logo.png"
    alt="FinTrack"
    width={110}
    height={35}
    className="mb-1 h-auto w-[150px]"
  />
</div>
        <nav className="flex flex-col gap-2">
          {sidebarItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold text-foreground/70 transition-all hover:bg-surface-high dark:text-white/70 dark:hover:bg-white/10",
                  active && "bg-primary text-white shadow-lift hover:bg-primary",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="min-w-0 truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-surface/80 px-5 shadow-sm backdrop-blur-xl dark:bg-[#101418]/80 md:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Kembali"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary transition hover:bg-surface-high active:scale-95 dark:text-primary-soft"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="truncate font-display text-xl font-extrabold text-primary dark:text-primary-soft">{title}</h1>
        </div>
        <div
       onClick={() => router.push("/profil")}
       className="cursor-pointer"
      >
      <ProfileAvatar
       name={profileName}
       className="h-12 w-12"
     />
      </div>
      </header>

      <main className="mx-auto max-w-6xl overflow-x-hidden px-5 pb-40 pt-6 md:ml-64 md:px-10 md:py-10">
        <div className="mb-6 hidden items-center justify-between md:flex">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground/60 dark:text-white/60">fintrack</p>
            <h1 className="truncate font-display text-3xl font-black text-primary dark:text-primary-soft">{title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <ThemeToggle />
            <ProfileAvatar name={profileName} className="h-12 w-12" />
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {children}
        </motion.div>
      </main>

      <nav className="safe-bottom fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-outline-soft/20 bg-surface/80 px-4 pt-2 shadow-nav backdrop-blur-xl dark:bg-[#101418]/80 md:hidden">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href === "/tambah-pengeluaran" && pathname === "/tambah-pemasukan");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-14 flex-col items-center justify-center rounded-full px-2 py-1 text-xs font-semibold text-foreground/75 transition active:scale-90 dark:text-white/70",
                active && item.label === "Tambah" && "bg-secondary-soft px-5 text-secondary shadow-soft sm:px-6",
                active && item.label !== "Tambah" && "text-primary dark:text-primary-soft",
              )}
            >
              <Icon className="mb-1 h-5 w-5 shrink-0" />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Button
        asChild
        aria-label="Tambah transaksi"
        className="fixed bottom-28 right-5 z-40 h-14 w-14 rounded-full p-0 md:bottom-8"
      >
        <Link href="/tambah-pengeluaran">
          <Plus className="h-6 w-6" />
        </Link>
      </Button>
    </div>
  );
}
