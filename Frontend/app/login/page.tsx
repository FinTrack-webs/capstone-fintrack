"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { fintrackApi, saveStoredAuth } from "@/utils/api";
import { useToast } from "@/components/ui/toast";
import { ThemeToggle } from "@/components/theme-toggle";
import type { AuthPayload } from "@/utils/api";

function isAuthPayload(data: AuthPayload | { requires_2fa?: boolean; email?: string }): data is AuthPayload {
  return Boolean("accessToken" in data && data.accessToken && "refreshToken" in data && data.refreshToken);
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [pendingTwoFactorEmail, setPendingTwoFactorEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pendingTwoFactorEmail && otpCode.trim().length !== 6) {
      toast({
        title: "Kode OTP belum lengkap",
        description: "Masukkan 6 digit kode OTP dari email.",
        variant: "info",
      });
      return;
    }

    if (!pendingTwoFactorEmail && (!email.trim() || !password)) {
      toast({
        title: "Data login belum lengkap",
        description: "Isi email dan password dulu.",
        variant: "info",
      });
      return;
    }

    setLoading(true);

    try {
      if (pendingTwoFactorEmail) {
        const response = await fintrackApi.verifyTwoFactor({
          email: pendingTwoFactorEmail,
          otp_code: otpCode.trim(),
        });

        saveStoredAuth(response.data);
        router.push("/dashboard");
        return;
      }

      const response = await fintrackApi.login({ email, password });

      if (!isAuthPayload(response.data)) {
        setPendingTwoFactorEmail(response.data.email ?? email);
        setOtpCode("");
        toast({
          title: "Kode OTP dikirim",
          description: "Cek email kamu untuk menyelesaikan login.",
        });
        return;
      }

      saveStoredAuth(response.data);
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: pendingTwoFactorEmail ? "OTP belum cocok" : "Gagal masuk",
        description: error instanceof Error ? error.message : "Coba cek data yang kamu masukkan.",
        variant: "info",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setResendLoading(true);

    try {
      const response = await fintrackApi.login({ email, password });

      if (isAuthPayload(response.data)) {
        saveStoredAuth(response.data);
        router.push("/dashboard");
        return;
      }

      setPendingTwoFactorEmail(response.data.email ?? email);
      toast({ title: "Kode OTP dikirim ulang", description: "Cek email kamu lagi ya." });
    } catch (error) {
      toast({
        title: "Gagal kirim ulang OTP",
        description: error instanceof Error ? error.message : "Coba beberapa saat lagi.",
        variant: "info",
      });
    } finally {
      setResendLoading(false);
    }
  }

  function resetLoginStep() {
    setPendingTwoFactorEmail("");
    setOtpCode("");
  }

  return (
    <main className="relative overflow-hidden grid min-h-dvh place-items-center bg-gradient-to-br from-[#f7f4ff] via-[#eefaf8] to-[#edf5ff] px-5 py-10 text-foreground dark:from-[#101418] dark:via-[#101418] dark:to-[#151b21]">
     <div className="absolute right-5 top-5 z-10 hidden sm:block">
      <ThemeToggle />
     </div>
     <div className="pointer-events-none absolute left-[-80px] top-[-80px] h-[320px] w-[320px] rounded-full bg-[#cdbdff]/35 blur-3xl" />
     <div className="pointer-events-none absolute right-[-120px] top-[120px] h-[340px] w-[340px] rounded-full bg-[#9ff3cf]/30 blur-3xl" />
     <div className="pointer-events-none absolute bottom-[-120px] left-[10%] h-[300px] w-[300px] rounded-full bg-[#b7cfff]/25 blur-3xl" />
     <div className="pointer-events-none absolute bottom-[-120px] right-[5%] h-[260px] w-[260px] rounded-full bg-[#d8c4ff]/25 blur-3xl" />
      <Card className="relative z-10 w-full max-w-md">
        <div className="mb-4 flex justify-end sm:hidden">
          <ThemeToggle />
        </div>
        <Link href="/" className="flex justify-center">
         <Image
          src="/logo.png"
          alt="FinTrack"
          width={220}
          height={70}
          priority
          className="mx-auto h-auto w-[220px]"
         />
     </Link>
        <CardTitle className="mt-0 text-3xl">{pendingTwoFactorEmail ? "Cek OTP dulu" : "Masuk dulu yuk"}</CardTitle>
        <CardText className="mt-4">
          {pendingTwoFactorEmail
            ? `Masukkan kode 6 digit yang dikirim ke ${pendingTwoFactorEmail}.`
            : "Semua pemasukan dan pengeluaran rapih di sini"}
        </CardText>
        <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
          {pendingTwoFactorEmail ? (
            <div className="relative">
              <ShieldCheck className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
              <Input
                className="pl-14 tracking-[0.35em]"
                placeholder="Kode OTP"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                required
              />
            </div>
          ) : (
            <>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
                <Input className="pl-14" placeholder="Email kamu" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
              <div className="relative">
                <LockKeyhole className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
                <Input className="pl-14" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </div>
            </>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (pendingTwoFactorEmail ? "Memverifikasi..." : "Masuk...") : pendingTwoFactorEmail ? "Verifikasi OTP" : "Masuk"}
            <ArrowRight className="h-5 w-5" />
          </Button>
          {pendingTwoFactorEmail ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="outline" onClick={handleResendOtp} disabled={resendLoading || loading}>
                <RotateCcw className="h-4 w-4" />
                {resendLoading ? "Mengirim..." : "Kirim Ulang"}
              </Button>
              <Button type="button" variant="ghost" onClick={resetLoginStep} disabled={loading || resendLoading}>
                Ganti Email
              </Button>
            </div>
          ) : null}
        </form>
        <p className="mt-7 text-center text-sm text-foreground/64 dark:text-white/85">
          Belum punya akun?{" "}
          <Link href="/register" className="font-bold text-secondary dark:text-secondary-soft">
            Daftar di sini
          </Link>
        </p>
      </Card>
    </main>
  );
}
