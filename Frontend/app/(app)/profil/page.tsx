"use client";

import { useEffect, useState } from "react";
import { Camera, ImageIcon, KeyRound, LogOut, Mail, MapPin, Phone, Save, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import type { UserProfile } from "@/types/finance";
import { clearStoredAuth, fintrackApi, getStoredAuth } from "@/utils/api";

const avatarTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const maxAvatarSize = 2 * 1024 * 1024;
type ProfileErrors = Partial<Record<"fullName" | "phone" | "address", string>>;

export default function ProfilPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [openUpload, setOpenUpload] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [fallbackEmail, setFallbackEmail] = useState("Akun FinTrack");
  const email = profile?.email ?? fallbackEmail;
  const name = fullName || profile?.full_name || email;

  useEffect(() => {
    const auth = getStoredAuth();

    if (auth?.user.email) {
      setFallbackEmail(auth.user.email);
    }

    fintrackApi
      .profile()
      .then((response) => {
        setProfile(response.data);
        setFullName(response.data.full_name ?? "");
        setPhone(response.data.phone ?? "");
        setAddress(response.data.address ?? "");
        setTwoFaEnabled(Boolean(response.data.two_fa_enabled));
      })
      .catch(() => setProfile(null));
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  function validateProfileForm() {
    const nextErrors: ProfileErrors = {};

    if (!fullName.trim()) {
      nextErrors.fullName = "Nama lengkap wajib diisi.";
    }

    if (!phone.trim()) {
      nextErrors.phone = "Nomor telepon wajib diisi.";
    }

    if (!address.trim()) {
      nextErrors.address = "Alamat wajib diisi.";
    }

    setProfileErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleLogout() {
    const auth = getStoredAuth();
    setLogoutLoading(true);

    try {
      if (auth?.refreshToken) {
        await fintrackApi.logout(auth.refreshToken);
      }
    } catch {
      toast({
        title: "Sesi lokal ditutup",
        description: "Logout di server belum merespons, tapi akses di perangkat ini sudah dibersihkan.",
        variant: "info",
      });
    } finally {
      clearStoredAuth();
      sessionStorage.clear();
      router.replace("/login");
    }
  }

  async function handleLogoutAll() {
    setLogoutAllLoading(true);

    try {
      await fintrackApi.logoutAll();
      toast({ title: "Semua sesi ditutup", description: "Akun kamu sudah keluar dari semua perangkat." });
    } catch (error) {
      toast({
        title: "Logout semua perangkat belum lengkap",
        description: error instanceof Error ? error.message : "Sesi lokal tetap dibersihkan.",
        variant: "info",
      });
    } finally {
      clearStoredAuth();
      sessionStorage.clear();
      router.replace("/login");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateProfileForm()) {
      toast({
        title: "Lengkapi data akun",
        description: "Nama lengkap, nomor telepon, dan alamat wajib diisi.",
        variant: "info",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fintrackApi.updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      setProfile(response.data);
      setFullName(response.data.full_name ?? "");
      setPhone(response.data.phone ?? "");
      setAddress(response.data.address ?? "");
      setProfileErrors({});
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
  }

  async function handleAvatarSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!avatarFile) {
      setAvatarError("Pilih gambar avatar dulu.");
      return;
    }

    setAvatarLoading(true);

    try {
      const response = await fintrackApi.uploadAvatar(avatarFile);
      setProfile((current) => ({ ...(current ?? response.data), ...response.data }));
      window.dispatchEvent(new Event("fintrack-profile-updated"));
      setAvatarFile(null);
      setAvatarPreview("");
      setAvatarError("");
      setOpenUpload(false);
      toast({ title: "Avatar diperbarui", description: "Foto profil kamu sudah ikut tersimpan." });
    } catch (error) {
      toast({
        title: "Gagal menyimpan avatar",
        description: error instanceof Error ? error.message : "Gunakan URL gambar yang bisa diakses publik.",
        variant: "info",
      });
    } finally {
      setAvatarLoading(false);
    }
  }

  function handleAvatarFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!avatarTypes.includes(file.type)) {
      setAvatarFile(null);
      setAvatarError("Format harus JPG, PNG, atau WEBP.");
      return;
    }

    if (file.size > maxAvatarSize) {
      setAvatarFile(null);
      setAvatarError("Ukuran gambar maksimal 2MB.");
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarError("");
  }

  async function handleToggleTwoFa() {
    const nextValue = !twoFaEnabled;
    setTwoFaLoading(true);

    try {
      const response = await fintrackApi.updateTwoFactor({ enabled: nextValue });
      setTwoFaEnabled(nextValue);
      setProfile((current) => ({ ...(current ?? response.data), ...response.data, two_fa_enabled: nextValue }));
      toast({
        title: nextValue ? "2FA diaktifkan" : "2FA dimatikan",
        description: nextValue ? "Akun kamu punya lapisan keamanan tambahan." : "Pengaturan keamanan berhasil diperbarui.",
      });
    } catch (error) {
      toast({
        title: "Gagal mengubah 2FA",
        description: error instanceof Error ? error.message : "Backend belum bisa memperbarui 2FA.",
        variant: "info",
      });
    } finally {
      setTwoFaLoading(false);
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordLoading(true);

    try {
      await fintrackApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      toast({ title: "Password berhasil diganti", description: "Akun kamu makin aman." });
    } catch (error) {
      toast({
        title: "Gagal ganti password",
        description: error instanceof Error ? error.message : "Coba cek password lama dan password baru.",
        variant: "info",
      });
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-7">
        <form className="space-y-7" onSubmit={handleSubmit} noValidate>
          <Card className="flex flex-col items-center text-center">
            <button type="button" className="relative" onClick={() => setOpenUpload(true)}>
              <ProfileAvatar name={name} src={profile?.avatar_url ?? undefined} className="h-24 w-24 text-3xl" />
              <span className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full bg-primary text-white shadow-lift">
                <Camera className="h-4 w-4" />
              </span>
            </button>
            <h2 className="mt-4 break-all font-display text-2xl font-black text-primary dark:text-primary-soft">{email}</h2>
          </Card>

          <Card className="grid gap-5">
            <div>
              <label className="mb-2 block text-xs font-bold tracking-[0.05em] text-foreground/70 dark:text-white/70">Email</label>
              <Input value={email} type="email" readOnly />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold tracking-[0.05em] text-foreground/70 dark:text-white/70">Nama Lengkap</label>
              <Input
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value);
                  setProfileErrors((current) => ({ ...current, fullName: undefined }));
                }}
                placeholder="Nama kamu"
                className={profileErrors.fullName ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : undefined}
                aria-invalid={Boolean(profileErrors.fullName)}
              />
              {profileErrors.fullName ? <p className="mt-2 text-sm font-semibold text-red-500">{profileErrors.fullName}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold tracking-[0.05em] text-foreground/70 dark:text-white/70">Nomor Telepon</label>
              <Input
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setProfileErrors((current) => ({ ...current, phone: undefined }));
                }}
                placeholder="08xxxxxxxxxx"
                className={profileErrors.phone ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : undefined}
                aria-invalid={Boolean(profileErrors.phone)}
              />
              {profileErrors.phone ? <p className="mt-2 text-sm font-semibold text-red-500">{profileErrors.phone}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold tracking-[0.05em] text-foreground/70 dark:text-white/70">Alamat</label>
              <Input
                value={address}
                onChange={(event) => {
                  setAddress(event.target.value);
                  setProfileErrors((current) => ({ ...current, address: undefined }));
                }}
                placeholder="Alamat utama kamu"
                className={profileErrors.address ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : undefined}
                aria-invalid={Boolean(profileErrors.address)}
              />
              {profileErrors.address ? <p className="mt-2 text-sm font-semibold text-red-500">{profileErrors.address}</p> : null}
            </div>
            <Button type="submit" size="lg" disabled={loading}>
              <Save className="h-5 w-5" />
              {loading ? "Menyimpan..." : "Simpan Pengaturan Akun"}
            </Button>
          </Card>
        </form>

        <div className="grid gap-7 md:grid-cols-2">
          <Card>
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-secondary-soft text-secondary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle>Verifikasi 2 Langkah</CardTitle>
            <CardText className="mt-1">
              {twoFaEnabled ? "Aktif. Login akun punya perlindungan tambahan." : "Belum aktif. Nyalakan untuk keamanan ekstra."}
            </CardText>
            <Button className="mt-5 w-full" variant={twoFaEnabled ? "outline" : "secondary"} onClick={handleToggleTwoFa} disabled={twoFaLoading}>
              {twoFaLoading ? "Memperbarui..." : twoFaEnabled ? "Matikan 2FA" : "Aktifkan 2FA"}
            </Button>
          </Card>

          <Card>
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-secondary-soft text-secondary">
              <Mail className="h-6 w-6" />
            </div>
            <CardTitle>Kontak</CardTitle>
            <CardText className="mt-1 break-all">{email}</CardText>
            <div className="mt-4 space-y-2 text-sm font-semibold text-foreground/70 dark:text-white/70">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {phone || "Nomor telepon belum diisi"}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {address || "Alamat belum diisi"}
              </p>
            </div>
          </Card>
        </div>

        <form className="space-y-7" onSubmit={handlePasswordSubmit}>
          <Card className="grid gap-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary-soft text-secondary">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Ganti Password</CardTitle>
                <CardText className="mt-1">Perbarui password tanpa keluar dari akun.</CardText>
              </div>
            </div>
            <Input
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Password saat ini"
              type="password"
              required
            />
            <Input
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Password baru"
              type="password"
              required
              minLength={8}
            />
            <Button type="submit" disabled={passwordLoading || !currentPassword || !newPassword}>
              <Save className="h-5 w-5" />
              {passwordLoading ? "Mengganti..." : "Ganti Password"}
            </Button>
          </Card>
        </form>

        <div className="grid gap-7 md:grid-cols-2">
          <Card
            onClick={handleLogout}
            className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
            aria-busy={logoutLoading}
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300">
              <LogOut className="h-6 w-6" />
            </div>
            <CardTitle>Keluar</CardTitle>
            <CardText className="mt-1">{logoutLoading ? "Lagi menutup sesi..." : "Keluar dari perangkat ini."}</CardText>
          </Card>

          <Card
            onClick={handleLogoutAll}
            className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
            aria-busy={logoutAllLoading}
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300">
              <LogOut className="h-6 w-6" />
            </div>
            <CardTitle>Keluar Semua Perangkat</CardTitle>
            <CardText className="mt-1">{logoutAllLoading ? "Menutup semua sesi..." : "Cabut akses akun dari semua perangkat."}</CardText>
          </Card>
        </div>

        <Card className="bg-primary text-white dark:bg-primary">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white/14">
              <UserRound className="h-6 w-6" />
            </div>
            <div>
              <p className="mt-1 text-sm text-white/74">Terhubung ke alur masuk, profil, password, avatar, 2FA, dan sesi perangkat.</p>
            </div>
          </div>
        </Card>
      </div>

      <Modal open={openUpload} title="Foto Profil" onClose={() => setOpenUpload(false)}>
        <form className="space-y-5" onSubmit={handleAvatarSubmit}>
          <div className="flex items-center gap-4">
            {avatarPreview ? (
              <ProfileAvatar name={name} src={avatarPreview} className="h-16 w-16 text-xl" />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary-soft text-secondary">
                <ImageIcon className="h-7 w-7" />
              </div>
            )}
            <div className="min-w-0">
              <CardTitle>Upload Gambar</CardTitle>
              <CardText className="mt-1">JPG, PNG, atau WEBP. Maksimal 2MB.</CardText>
            </div>
          </div>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-card border border-dashed border-outline-soft/60 bg-surface-low px-5 py-7 text-center transition hover:border-primary hover:bg-surface-high dark:bg-white/10 dark:hover:bg-white/15">
            <Camera className="mb-3 h-6 w-6 text-primary dark:text-primary-soft" />
            <span className="font-display text-sm font-extrabold text-primary dark:text-primary-soft">
              {avatarFile ? avatarFile.name : "Pilih gambar dari perangkat"}
            </span>
            <input className="hidden" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleAvatarFileChange} />
          </label>
          {avatarError ? <p className="text-sm font-semibold text-red-500">{avatarError}</p> : null}
          <Button className="w-full" type="submit" disabled={avatarLoading}>
            <Save className="h-5 w-5" />
            {avatarLoading ? "Mengunggah..." : "Upload"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
