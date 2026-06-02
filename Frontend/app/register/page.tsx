"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useToast } from "@/components/ui/toast";
import { fintrackApi } from "@/utils/api";
import { ThemeToggle } from "@/components/theme-toggle";
import type { AuthPayload } from "@/utils/api";

function isAuthPayload(data: AuthPayload | { requires_email_verification?: boolean; email?: string }): data is AuthPayload {
  return Boolean("accessToken" in data && data.accessToken && "refreshToken" in data && data.refreshToken);
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pendingVerificationEmail && otpCode.trim().length !== 6) {
      toast({
        title: "Kode OTP belum lengkap",
        description: "Masukkan 6 digit kode verifikasi dari email.",
        variant: "info",
      });
      return;
    }

    if (!pendingVerificationEmail && (!email.trim() || password.length < 6)) {
      toast({
        title: "Data daftar belum lengkap",
        description: "Isi email dan password minimal 6 karakter.",
        variant: "info",
      });
      return;
    }

    setLoading(true);

    try {
      if (pendingVerificationEmail) {
        await fintrackApi.verifyEmail({
          email: pendingVerificationEmail,
          otp_code: otpCode.trim(),
        });

        toast({
          title: "Email berhasil diverifikasi",
          description: "Akun kamu sudah aktif. Silakan masuk untuk lanjut.",
        });
        router.push("/login");
        return;
      }

      const response = await fintrackApi.register({ email, password });

      if (isAuthPayload(response.data)) {
        toast({
          title: "Akun berhasil dibuat",
          description: "Silakan masuk dengan email dan password kamu.",
        });
        router.push("/login");
        return;
      }

      setPendingVerificationEmail(response.data.email ?? email);
      setOtpCode("");
      toast({
        title: "Kode verifikasi dikirim",
        description: "Cek email kamu untuk mengaktifkan akun.",
      });
    } catch (error) {
      toast({
        title: pendingVerificationEmail ? "Verifikasi gagal" : "Gagal daftar",
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
      await fintrackApi.resendVerificationOtp({ email: pendingVerificationEmail });
      toast({ title: "Kode dikirim ulang", description: "Cek email kamu lagi ya." });
    } catch (error) {
      toast({
        title: "Gagal kirim ulang kode",
        description: error instanceof Error ? error.message : "Coba beberapa saat lagi.",
        variant: "info",
      });
    } finally {
      setResendLoading(false);
    }
  }

  function resetRegisterStep() {
    setPendingVerificationEmail("");
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
        <CardTitle className="mt-0 text-3xl">{pendingVerificationEmail ? "Verifikasi email" : "Daftar bentar aja"}</CardTitle>
        <CardText className="mt-4">
          {pendingVerificationEmail
            ? `Masukkan kode 6 digit yang dikirim ke ${pendingVerificationEmail}.`
            : "Cukup email dan password saja. Simpel, sat-set."}
        </CardText>
        <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
          {pendingVerificationEmail ? (
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
                <Input className="pl-14" placeholder="Email aktif" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
              <div className="relative">
                <LockKeyhole className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
                <Input className="pl-14" placeholder="Password minimal 6 karakter" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </div>
            </>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (pendingVerificationEmail ? "Memverifikasi..." : "Membuat...") : pendingVerificationEmail ? "Verifikasi Email" : "Buat Akun"}
            <ArrowRight className="h-5 w-5" />
          </Button>
          {pendingVerificationEmail ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="outline" onClick={handleResendOtp} disabled={resendLoading || loading}>
                <RotateCcw className="h-4 w-4" />
                {resendLoading ? "Mengirim..." : "Kirim Ulang"}
              </Button>
              <Button type="button" variant="ghost" onClick={resetRegisterStep} disabled={loading || resendLoading}>
                Ganti Email
              </Button>
            </div>
          ) : null}
        </form>
        <p className="mt-7 text-center text-sm text-foreground/64 dark:text-white/85">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-bold text-secondary dark:text-secondary-soft">
            Masuk aja
          </Link>
        </p>
      </Card>
    </main>
  );
}
