"use client";

import { useEffect, useState } from "react";
import { TransactionForm } from "@/components/transaction-form";
import type { Category } from "@/types/finance";
import { fintrackApi } from "@/utils/api";
import { toCategory } from "@/utils/data-mappers";

export default function TambahTransaksiPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fintrackApi
      .categories()
      .then((response) => setCategories(response.data.map(toCategory)))
      .catch(() => setCategories([]));
  }, []);

  return <TransactionForm categories={categories} />;
}
