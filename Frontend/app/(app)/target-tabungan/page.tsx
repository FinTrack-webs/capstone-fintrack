"use client";

import { useEffect, useState } from "react";
import { Pencil, PiggyBank, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import type { SavingsGoal } from "@/types/finance";
import { fintrackApi } from "@/utils/api";
import { formatRupiah } from "@/utils/format";

export default function TargetTabunganPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SavingsGoal | null>(null);
  const [deleting, setDeleting] = useState<SavingsGoal | null>(null);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  function loadGoals() {
    fintrackApi
      .savingsGoals()
      .then((response) => setGoals(response.data))
      .catch(() => setGoals([]));
  }

  useEffect(() => {
    loadGoals();
  }, []);

  function openForm(goal?: SavingsGoal) {
    setEditing(goal ?? null);
    setName(goal?.name ?? "");
    setTargetAmount(goal ? String(goal.target_amount) : "");
    setCurrentAmount(goal ? String(goal.current_amount) : "0");
    setOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const body = {
        name,
        target_amount: Number(targetAmount),
        current_amount: Number(currentAmount) || 0,
      };
      if (editing) {
        await fintrackApi.updateSavingsGoal(editing.id, body);
      } else {
        await fintrackApi.createSavingsGoal(body);
      }
      toast({ title: editing ? "Target diperbarui" : "Target dibuat", description: "Target tabungan kamu sudah tersimpan." });
      setOpen(false);
      loadGoals();
    } catch (error) {
      toast({
        title: "Gagal menyimpan target",
        description: error instanceof Error ? error.message : "Backend belum menerima target tabungan.",
        variant: "info",
      });
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setLoading(true);

    try {
      await fintrackApi.deleteSavingsGoal(deleting.id);
      toast({ title: "Target dihapus", description: "Target tabungan sudah dibersihkan." });
      setDeleting(null);
      loadGoals();
    } catch (error) {
      toast({
        title: "Gagal hapus target",
        description: error instanceof Error ? error.message : "Backend belum menghapus target.",
        variant: "info",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-7">
      <Card className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Target Tabungan</CardTitle>
          <CardText className="mt-1">Bikin tujuan nabung biar progresnya kebaca tiap hari.</CardText>
        </div>
        <Button onClick={() => openForm()}>
          <Plus className="h-4 w-4" />
          Tambah Target
        </Button>
      </Card>

      <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
        {goals.map((goal) => {
          const progress = goal.progress_percentage ?? Math.min(100, Math.round((Number(goal.current_amount) / Number(goal.target_amount || 1)) * 100));

          return (
            <Card key={goal.id}>
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-secondary-soft text-secondary">
                <PiggyBank className="h-6 w-6" />
              </div>
              <CardTitle>{goal.name}</CardTitle>
              <CardText className="mt-1">
                {formatRupiah(goal.current_amount)} dari {formatRupiah(goal.target_amount)}
              </CardText>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-surface-high dark:bg-white/10">
                <div className="h-full rounded-full bg-secondary" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-bold text-secondary">{progress}%</span>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => openForm(goal)} aria-label="Edit target">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => setDeleting(goal)} aria-label="Hapus target">
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-300" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && (
        <Card className="text-center">
          <CardTitle>Belum ada target</CardTitle>
          <CardText className="mt-1">Mulai dari dana darurat, modal usaha, atau alat kerja baru.</CardText>
        </Card>
      )}

      <Modal open={open} title={editing ? "Edit Target" : "Tambah Target"} onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama target" required />
          <Input value={targetAmount} inputMode="numeric" onChange={(event) => setTargetAmount(event.target.value.replace(/\D/g, ""))} placeholder="Nominal target" required />
          <Input value={currentAmount} inputMode="numeric" onChange={(event) => setCurrentAmount(event.target.value.replace(/\D/g, ""))} placeholder="Sudah terkumpul" />
          <Button className="w-full" disabled={loading || !name || !targetAmount}>
            <Save className="h-4 w-4" />
            {loading ? "Menyimpan..." : "Simpan Target"}
          </Button>
        </form>
      </Modal>

      <Modal open={Boolean(deleting)} title="Hapus Target" onClose={() => setDeleting(null)}>
        <CardText>Target tabungan ini akan dihapus permanen.</CardText>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button variant="outline" onClick={() => setDeleting(null)}>
            Batal
          </Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={confirmDelete} disabled={loading}>
            <Trash2 className="h-4 w-4" />
            {loading ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
