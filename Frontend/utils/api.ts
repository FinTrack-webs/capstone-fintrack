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
  ExpenseDistribution,
  SavingsGoal,
  UserProfile,
} from "@/types/finance";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_FINTRACK_API_URL ?? "https://backend-fintrack-production.up.railway.app/api";

type RequestOptions = RequestInit & {
  accessToken?: string;
  timeoutMs?: number;
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
  user: { id?: string; email: string };
  accessToken: string;
  refreshToken: string;
};

export type AuthPayload = {
  user: { id?: string; email: string };
  accessToken: string;
  refreshToken: string;
};

export type TwoFactorChallenge = {
  requires_2fa: true;
  email: string;
};

export type RegisterVerificationChallenge = {
  requires_email_verification: true;
  email: string;
};

const AUTH_STORAGE_KEY = "fintrack-auth";

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuth>;

    if (!parsed.accessToken || !parsed.refreshToken || !parsed.user?.email) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return parsed as StoredAuth;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function saveStoredAuth(auth: StoredAuth) {
  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      ...auth,
      user: {
        ...auth.user,
        id: auth.user.id ?? auth.user.email,
      },
    }),
  );
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

  const timeoutMs = options.timeoutMs ?? 60000;
  const controller = new AbortController();
  const timeout = timeoutMs > 0 ? window.setTimeout(() => controller.abort(), timeoutMs) : null;
  const fetchOptions = { ...options };
  delete fetchOptions.accessToken;
  delete fetchOptions.timeoutMs;
  delete fetchOptions.signal;

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Server gagal merespon. Silahkan coba lagi nanti.");
    }

    throw error;
  } finally {
    if (timeout) {
      window.clearTimeout(timeout);
    }
  }

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

async function requestBlobWithAuth(path: string, options: RequestOptions = {}) {
  const auth = getStoredAuth();

  if (!auth?.accessToken) {
    throw new Error("Silakan masuk dulu untuk mengakses data FinTrack");
  }

  async function fetchBlob(accessToken: string) {
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let message = "Permintaan ke FinTrack gagal";

      try {
        const payload = (await response.json()) as ApiResponse<unknown>;
        message = payload.message ?? message;
      } catch {
        // CSV/export responses are not guaranteed to return JSON on failure.
      }

      throw new ApiError(message, response.status);
    }

    return response.blob();
  }

  try {
    return await fetchBlob(auth.accessToken);
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

    return fetchBlob(nextAuth.accessToken);
  }
}

async function requestFormDataWithAuth<T>(path: string, body: FormData, options: RequestOptions = {}) {
  const auth = getStoredAuth();

  if (!auth?.accessToken) {
    throw new Error("Silakan masuk dulu untuk mengakses data FinTrack");
  }

  async function sendFormData(accessToken: string) {
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      method: options.method ?? "POST",
      headers,
      body,
    });
    const payload = (await response.json()) as ApiResponse<T>;

    if (!response.ok) {
      throw new ApiError(payload.message ?? "Permintaan ke FinTrack gagal", response.status);
    }

    return payload;
  }

  try {
    return await sendFormData(auth.accessToken);
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

    return sendFormData(nextAuth.accessToken);
  }
}

export const fintrackApi = {
  login: (body: { email: string; password: string }) =>
    request<AuthPayload | TwoFactorChallenge>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  register: (body: { email: string; password: string }) =>
    request<AuthPayload | RegisterVerificationChallenge>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  verifyTwoFactor: (body: { email: string; otp_code: string }) =>
    request<AuthPayload>("/auth/verify-2fa", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  verifyEmail: (body: { email: string; otp_code: string }) =>
    request<{ email?: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  resendVerificationOtp: (body: { email: string }) =>
    request<null>("/auth/resend-verification-otp", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  logout: (refreshToken: string) =>
    request<null>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
  logoutAll: () =>
    requestWithAuth<null>("/auth/logout-all", {
      method: "POST",
    }),
  dashboard: () => requestWithAuth<DashboardSummary>("/dashboard"),
  transactions: (params?: URLSearchParams) =>
    requestWithAuth<BackendTransaction[]>(`/transactions${params ? `?${params.toString()}` : ""}`),
  exportTransactions: (params?: URLSearchParams) =>
    requestBlobWithAuth(`/transactions/export${params ? `?${params.toString()}` : ""}`),
  updateTransaction: (
    id: string,
    body: {
      category_id?: number;
      amount: number;
      description: string;
      date: string;
      account_type: AccountType;
      transaction_type: ApiTransactionType;
    },
  ) =>
    requestWithAuth<BackendTransaction>(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteTransaction: (id: string) =>
    requestWithAuth<null>(`/transactions/${id}`, {
      method: "DELETE",
    }),
  categories: () => request<BackendCategory[]>("/categories"),
  incomeVsExpense: (params?: URLSearchParams) =>
    requestWithAuth<Array<{ label: string; income: number; expense: number }>>(
      `/analytics/income-vs-expense?${params ? params.toString() : "period=monthly"}`,
    ),
  monthlyExpenses: (params?: URLSearchParams) =>
    requestWithAuth<Array<{ month: string; total_expense?: number; total?: number }>>(
      `/analytics/monthly-expenses${params ? `?${params.toString()}` : ""}`,
    ),
  profile: () => requestWithAuth<UserProfile>("/users/profile"),
  updateProfile: (body: { full_name?: string; phone?: string; address?: string }) =>
    requestWithAuth<UserProfile>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  updateAvatar: (body: { avatar_url: string }) =>
    requestWithAuth<UserProfile>("/users/avatar", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  uploadAvatar: (file: File) => {
    const body = new FormData();
    body.append("avatar", file);

    return requestFormDataWithAuth<UserProfile>("/users/avatar/upload", body);
  },
  updateTwoFactor: (body: { enabled: boolean }) =>
    requestWithAuth<UserProfile>("/users/2fa", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  changePassword: (body: { current_password: string; new_password: string }) =>
    requestWithAuth<null>("/users/password", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  aiInsights: () => requestWithAuth<AiInsight[]>("/ai/insights"),
  financialHealthScore: () => requestWithAuth<FinancialHealthScore>("/ai/financial-health-score"),
  expenseDistribution: (params?: URLSearchParams) =>
    requestWithAuth<ExpenseDistribution[]>(`/analytics/expense-distribution${params ? `?${params.toString()}` : ""}`),
  savingsGoals: () => requestWithAuth<SavingsGoal[]>("/savings-goals"),
  createSavingsGoal: (body: { name: string; target_amount: number; current_amount?: number }) =>
    requestWithAuth<SavingsGoal>("/savings-goals", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateSavingsGoal: (id: string, body: { name: string; target_amount: number; current_amount?: number }) =>
    requestWithAuth<SavingsGoal>(`/savings-goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteSavingsGoal: (id: string) =>
    requestWithAuth<null>(`/savings-goals/${id}`, {
      method: "DELETE",
    }),
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
