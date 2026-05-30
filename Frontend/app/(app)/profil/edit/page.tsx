"use client";

import { useEffect, useState } from "react";
import { Camera, Save } from "lucide-react";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { fintrackApi, getStoredAuth } from "@/utils/api";

export default function EditProfilPage() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(() => getStoredAuth()?.user.email ?? "");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fintrackApi
      .profile()
      .then((response) => {
        setEmail(response.data.email);
        setFullName(response.data.full_name ?? "");
      })
      .catch(() => undefined);
  }, []);

  return (
    <>
      <form
        className="space-y-7"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          try {
            await fintrackApi.updateProfile({ full_name: fullName });
            toast({ title: "Profil berhasil disimpan", description: "Data akun kamu sudah rapi lagi." });
          } catch (error) {
            toast({
              title: "Gagal menyimpan profil",
              description: error instanceof Error ? error.message : "Backend belum menerima perubahan profil.",
              variant: "info",
            });
          } finally {
            setLoading(false);
          }
        }}
      >
        <Card className="flex flex-col items-center text-center">
          <button type="button" className="relative" onClick={() => setOpen(true)}>
            <ProfileAvatar name={fullName || email || "FinTrack"} className="h-24 w-24 text-3xl" />
            <span className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full bg-primary text-white shadow-lift">
              <Camera className="h-4 w-4" />
            </span>
          </button>
          <CardTitle className="mt-4">Foto profil</CardTitle>
          <CardText className="mt-1">Belum upload foto? Tenang, avatar inisial tetap kelihatan rapi.</CardText>
        </Card>

        <Card className="grid gap-5">
          <div>
            <label className="mb-2 block text-xs font-bold tracking-[0.05em] text-foreground/70 dark:text-white/70">Email</label>
            <Input value={email} type="email" readOnly />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold tracking-[0.05em] text-foreground/70 dark:text-white/70">Nama Lengkap</label>
            <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Nama kamu" />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold tracking-[0.05em] text-foreground/70 dark:text-white/70">Password Baru</label>
            <Input placeholder="Minimal 6 karakter" type="password" />
          </div>
          <Button type="submit" size="lg" disabled={loading}>
            <Save className="h-5 w-5" />
            {loading ? "Menyimpan..." : "Simpan Profil"}
          </Button>
        </Card>
      </form>

      <Modal open={open} title="Upload Foto" onClose={() => setOpen(false)}>
        <p className="text-sm leading-6 text-foreground/70 dark:text-white/70">
          Upload foto belum tersedia di backend aktif. Profil teks tetap bisa diperbarui.
        </p>
        <Button className="mt-5 w-full" onClick={() => setOpen(false)}>
          Sip, paham
        </Button>
      </Modal>
    </>
  );
}
