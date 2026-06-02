"use client";

import { useEffect, useState } from "react";
import { TransactionForm } from "@/components/transaction-form";
import type { Category } from "@/types/finance";
import { fintrackApi } from "@/utils/api";
import { toCategory } from "@/utils/data-mappers";

export default function TambahPemasukanPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fintrackApi
      .categories()
      .then((response) => setCategories(response.data.map(toCategory).filter((category) => category.type === "income")))
      .catch(() => setCategories([]));
  }, []);

  return <TransactionForm type="income" categories={categories} />;
}
