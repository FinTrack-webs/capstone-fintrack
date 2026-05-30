"use client";

import { useEffect, useState } from "react";
import { TransactionForm } from "@/components/transaction-form";
import type { Category } from "@/types/finance";
import { fintrackApi } from "@/utils/api";
import { toCategory } from "@/utils/data-mappers";

export default function TambahPengeluaranPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fintrackApi
      .categories()
      .then((response) => setCategories(response.data.map(toCategory).filter((category) => category.type === "expense")))
      .catch(() => setCategories([]));
  }, []);

  return <TransactionForm type="expense" categories={categories} />;
}
