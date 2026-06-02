import type {
  AccountType,
  ApiResponse,
  ApiTransactionType,
  AiInsight,
  BackendTransaction,
  BackendCategory,
  ChartPoint,
  DashboardSummary,
  FinancialHealthScore,
  UserProfile,
} from "@/types/finance";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_FINTRACK_API_URL ?? "https://backend-fintrack-production.up.railway.app/api";

type RequestOptions = RequestInit & {
  accessToken?: string;
};

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type StoredAuth = {
  user: { id: string; email: string };
  accessToken: string;
  refreshToken: string;
};

const AUTH_STORAGE_KEY = "fintrack-auth";

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function saveStoredAuth(auth: StoredAuth) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new ApiError(payload.message ?? "Permintaan ke FinTrack gagal", response.status);
  }

  return payload;
}

async function requestWithAuth<T>(path: string, options: RequestOptions = {}) {
  const auth = getStoredAuth();

  if (!auth?.accessToken) {
    throw new Error("Silakan masuk dulu untuk mengakses data FinTrack");
  }

  try {
    return await request<T>(path, { ...options, accessToken: auth.accessToken });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || !auth.refreshToken) {
      throw error;
    }

    const refreshed = await request<{ accessToken: string }>("/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken: auth.refreshToken }),
    });
    const nextAuth = { ...auth, accessToken: refreshed.data.accessToken };
    saveStoredAuth(nextAuth);

    return request<T>(path, { ...options, accessToken: nextAuth.accessToken });
  }
}

export const fintrackApi = {
  login: (body: { email: string; password: string }) =>
    request<{ user: { id: string; email: string }; accessToken: string; refreshToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  register: (body: { email: string; password: string }) =>
    request<{ id: string; email: string; created_at: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  logout: (refreshToken: string) =>
    request<null>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
  dashboard: () => requestWithAuth<DashboardSummary>("/dashboard"),
  transactions: (params?: URLSearchParams) =>
    requestWithAuth<BackendTransaction[]>(`/transactions${params ? `?${params.toString()}` : ""}`),
  categories: () => request<BackendCategory[]>("/categories"),
  incomeVsExpense: () => requestWithAuth<Array<{ label: string; income: number; expense: number }>>("/analytics/income-vs-expense?period=monthly"),
  profile: () => requestWithAuth<UserProfile>("/users/profile"),
  updateProfile: (body: { full_name?: string; phone?: string; address?: string }) =>
    requestWithAuth<UserProfile>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  aiInsights: () => requestWithAuth<AiInsight[]>("/ai/insights"),
  financialHealthScore: () => requestWithAuth<FinancialHealthScore>("/ai/financial-health-score"),
  predictOnly: (
    body: { description: string; transaction_type: ApiTransactionType; account_type: AccountType },
  ) =>
    requestWithAuth<{ predicted_category: string; confidence_score: number; mapped_category: string }>("/transactions/predict-only", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  createTransaction: (
    body: {
      category_id?: number;
      amount: number;
      description: string;
      date: string;
      account_type: AccountType;
      transaction_type: ApiTransactionType;
    },
  ) =>
    requestWithAuth<BackendTransaction>("/transactions", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export function toChartData(rows: Array<{ label: string; income: number; expense: number }>): ChartPoint[] {
  return rows.map((row) => ({
    month: row.label,
    pemasukan: Number(row.income) || 0,
    pengeluaran: Number(row.expense) || 0,
  }));
}
