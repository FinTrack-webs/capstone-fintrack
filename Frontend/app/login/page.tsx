"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { fintrackApi, saveStoredAuth } from "@/utils/api";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fintrackApi.login({ email, password });
      saveStoredAuth(response.data);
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Gagal masuk",
        description: error instanceof Error ? error.message : "Coba cek email dan password kamu.",
        variant: "info",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative overflow-hidden grid min-h-dvh place-items-center bg-gradient-to-br from-[#f7f4ff] via-[#eefaf8] to-[#edf5ff] px-5 py-10 text-foreground dark:bg-[#101418]">
     <div className="absolute top-[-80px] left-[-80px] h-[320px] w-[320px] rounded-full bg-[#cdbdff]/35 blur-3xl" />
     <div className="absolute top-[120px] right-[-120px] h-[340px] w-[340px] rounded-full bg-[#9ff3cf]/30 blur-3xl" />
     <div className="absolute bottom-[-120px] left-[10%] h-[300px] w-[300px] rounded-full bg-[#b7cfff]/25 blur-3xl" />
     <div className="absolute bottom-[-120px] right-[5%] h-[260px] w-[260px] rounded-full bg-[#d8c4ff]/25 blur-3xl" />
      <Card className="w-full max-w-md">
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
        <CardTitle className="mt-0 text-3xl">Masuk dulu yuk</CardTitle>
        <CardText className="mt-4">Semua pemasukan dan pengeluaran rapih di sini</CardText>
        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
            <Input className="pl-14" placeholder="Email kamu" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="relative">
            <LockKeyhole className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
            <Input className="pl-14" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Masuk..." : "Masuk"}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </form>
        <p className="mt-7 text-center text-sm text-foreground/64 dark:text-white/64">
          Belum punya akun?{" "}
          <Link href="/register" className="font-bold text-secondary">
            Daftar di sini
          </Link>
        </p>
      </Card>
    </main>
  );
}
