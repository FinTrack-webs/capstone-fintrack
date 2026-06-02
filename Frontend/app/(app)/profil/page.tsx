"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, Mail, UserRound } from "lucide-react";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import type { UserProfile } from "@/types/finance";
import { fintrackApi, getStoredAuth } from "@/utils/api";
import { useRouter } from "next/navigation";

export default function ProfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const email = profile?.email ?? getStoredAuth()?.user.email ?? "Akun FinTrack";
  const name = profile?.full_name || email;
  const handleLogout = () => {
  try {
    localStorage.clear();
    sessionStorage.clear();

    router.replace("/login");
  } catch (error) {
    console.error("Logout gagal:", error);
  }
};

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
        <Button asChild className="mt-5">
          <Link href="/profil/edit">Edit Profil</Link>
        </Button>
      </Card>

     <div className="grid gap-7 md:grid-cols-2">

  {/* EMAIL */}
  <Card>
    <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-secondary-soft text-secondary">
      <Mail className="h-6 w-6" />
    </div>

    <CardTitle>Email</CardTitle>
    <CardText className="mt-1">{email}</CardText>
  </Card>

  {/* LOGOUT */}
  <Card
    onClick={handleLogout}
    className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
  >
    <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-100 text-red-600">
      <LogOut className="h-6 w-6" />
    </div>

    <CardTitle>Keluar</CardTitle>

    <CardText className="mt-1">
      Klik untuk keluar dari akun.
    </CardText>
  </Card>

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
