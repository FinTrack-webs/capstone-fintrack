"use client";

import { useEffect, useState } from "react";
import { Filter, Search } from "lucide-react";
import { TransactionCard } from "@/components/transaction-card";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Transaction } from "@/types/finance";
import { fintrackApi } from "@/utils/api";
import { toTransaction } from "@/utils/data-mappers";

export default function TransaksiPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ limit: "100" });
    if (search.trim()) params.set("search", search.trim());

    const timer = window.setTimeout(() => {
      fintrackApi
        .transactions(params)
        .then((response) => setTransactions(response.data.map(toTransaction)))
        .catch(() => setTransactions([]));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-7">
      <Card>
        <CardTitle>Riwayat duit kamu</CardTitle>
        <CardText className="mt-1">Cari transaksi, cek mode akun, dan pantau status klasifikasi AI.</CardText>
        <div className="mt-5 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
            <Input className="pl-14" placeholder="Cari transaksi..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <Button size="icon" variant="outline" aria-label="Filter transaksi">
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </Card>

      <Card>
        <div className="mb-5 flex items-center justify-between gap-3">
          <CardTitle>Mei 2026</CardTitle>
          <span className="rounded-full bg-secondary-soft px-4 py-2 text-xs font-bold text-secondary">{transactions.length} transaksi</span>
        </div>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </Card>
    </div>
  );
}
