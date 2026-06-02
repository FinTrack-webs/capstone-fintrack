"use client";

import { useEffect, useState } from "react";
import { Bot, CheckCircle2, Lightbulb, Sparkles } from "lucide-react";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { businessAiLabels, personalAiLabels } from "@/constants/mock-data";
import type { AiInsight, BackendCategory, FinancialHealthScore } from "@/types/finance";
import { fintrackApi } from "@/utils/api";

export default function AiInsightPage() {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [score, setScore] = useState<FinancialHealthScore | null>(null);
  const [categories, setCategories] = useState<BackendCategory[]>([]);

  useEffect(() => {
    Promise.all([fintrackApi.aiInsights(), fintrackApi.financialHealthScore(), fintrackApi.categories()])
      .then(([insightsResponse, scoreResponse, categoryResponse]) => {
        setInsights(insightsResponse.data);
        setScore(scoreResponse.data);
        setCategories(categoryResponse.data);
      })
      .catch(() => {
        setInsights([]);
        setScore(null);
        setCategories([]);
      });
  }, []);

  return (
    <div className="space-y-7">
      <Card className="relative overflow-hidden bg-primary text-white dark:bg-primary">
        <div className="absolute -right-10 top-3 h-36 w-36 rounded-full bg-secondary-soft/20 blur-2xl" />
        <div className="relative flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/14">
            <Bot className="h-7 w-7" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-black">Halo, ini rangkuman AI buat kamu ✨</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/76">
              Insight ini sudah disesuaikan dengan mode AI pribadi dan bisnis, lalu hasilnya dirapikan ke kategori fintrack.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-7 lg:grid-cols-[.9fr_1.1fr]">
        <Card className="bg-secondary-soft/85 text-secondary">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-white/60">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-secondary">Skor Finansial: {score?.score ?? 0}</CardTitle>
          <CardText className="mt-2 text-secondary/75">Pemasukan dan pengeluaranmu dihitung otomatis.</CardText>
        </Card>

        <Card>
          <CardTitle>Saran cepat</CardTitle>
          <div className="mt-5 space-y-3">
            {insights.map((insight) => (
              <div key={insight.message} className="flex gap-3 rounded-card bg-surface-low p-4 dark:bg-white/10">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <p className="text-sm leading-6 text-foreground/76 dark:text-white/72">{insight.message}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="bg-tertiary-soft/45">
        <div className="flex gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-tertiary-soft text-tertiary">
            <Lightbulb className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-tertiary">Tips Hari Ini</CardTitle>
            <CardText className="mt-2 text-tertiary/80">
              Coba bikin amplop digital buat makan, transportasi, dan bisnis. Kalau satu amplop habis, jangan pinjam amplop lain dulu.
            </CardText>
          </div>
        </div>
      </Card>

      <div className="grid gap-7 lg:grid-cols-2">
        <Card>
          <CardTitle>Label Pribadi</CardTitle>
          <div className="mt-4 flex flex-wrap gap-2">
            {personalAiLabels.map((label) => (
              <span key={label} className="rounded-full bg-surface-low px-3 py-2 text-xs font-bold dark:bg-white/10">
                {label}
              </span>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>Label Bisnis</CardTitle>
          <div className="mt-4 flex flex-wrap gap-2">
            {businessAiLabels.map((label) => (
              <span key={label} className="rounded-full bg-surface-low px-3 py-2 text-xs font-bold dark:bg-white/10">
                {label}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card>
          <CardTitle>Pemetaan kategori</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {categories.map((item) => (
            <div key={item.id} className="rounded-card bg-surface-low p-4 text-sm dark:bg-white/10">
              <p className="font-bold text-primary dark:text-primary-soft">{item.name}</p>
              <p className="mt-1 text-foreground/64 dark:text-white/64">Tipe: {item.type === "income" ? "Pemasukan" : "Pengeluaran"}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
