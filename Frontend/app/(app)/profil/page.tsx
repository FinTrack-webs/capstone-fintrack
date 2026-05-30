"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import type { UserProfile } from "@/types/finance";
import { fintrackApi, getStoredAuth } from "@/utils/api";

export default function ProfilPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const email = profile?.email ?? getStoredAuth()?.user.email ?? "Akun FinTrack";
  const name = profile?.full_name || email;

  useEffect(() => {
    fintrackApi
      .profile()
      .then((response) => setProfile(response.data))
      .catch(() => setProfile(null));
  }, []);

  return (
    <div className="space-y-7">
      <Card className="flex flex-col items-center text-center">
        <ProfileAvatar name={name} className="h-24 w-24 text-3xl" />
        <h2 className="mt-4 font-display text-2xl font-black text-primary dark:text-primary-soft">{email}</h2>
        <p className="mt-1 text-sm text-foreground/64 dark:text-white/64">Sesi akun dari token akses</p>
        <Button asChild className="mt-5">
          <Link href="/profil/edit">Edit Profil</Link>
        </Button>
      </Card>

      <div className="grid gap-7 md:grid-cols-2">
        {[
          { icon: Mail, title: "Email", text: email },
          { icon: KeyRound, title: "Token Penyegar", text: "Disimpan buat ambil token akses baru" },
          { icon: ShieldCheck, title: "Keamanan", text: "Akun kamu aktif dan terenkripsi" },
          { icon: Bell, title: "Logout All", text: "Bisa cabut semua sesi dari semua perangkat" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-secondary-soft text-secondary">
                <Icon className="h-6 w-6" />
              </div>
              <CardTitle>{item.title}</CardTitle>
              <CardText className="mt-1">{item.text}</CardText>
            </Card>
          );
        })}
      </div>

      <Card className="bg-primary text-white dark:bg-primary">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white/14">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <p className="mt-1 text-sm text-white/74">Terhubung ke alur masuk, perbarui sesi, dan keluar dari semua perangkat.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
