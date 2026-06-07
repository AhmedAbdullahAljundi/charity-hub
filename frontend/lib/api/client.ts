import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

const LOCALE_KEY = "charityhub_lang";
const TOKEN_KEY = "charityhub_token";
const REFRESH_KEY = "charityhub_refresh";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    const locale = localStorage.getItem(LOCALE_KEY) || "ar";
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers["Accept-Language"] = locale;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post(
      `${api.defaults.baseURL}/auth/refresh`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );
    if (data?.data?.accessToken) {
      localStorage.setItem(TOKEN_KEY, data.data.accessToken);
      localStorage.setItem(REFRESH_KEY, data.data.refreshToken);
      return data.data.accessToken;
    }
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
  return null;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const token = await refreshPromise;
      refreshPromise = null;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
      if (typeof window !== "undefined" && window.location.pathname !== `/${localStorage.getItem(LOCALE_KEY) || "ar"}`) {
        clearAuthTokens();
        const locale = localStorage.getItem(LOCALE_KEY) || "ar";
        window.location.href = `/${locale}`;
      }
    } else if (error.response?.status && error.response.status >= 500) {
      const locale = typeof window !== "undefined" ? localStorage.getItem(LOCALE_KEY) || "ar" : "ar";
      const msg = locale === "ar" ? "حدث خطأ في الخادم. يرجى المحاولة لاحقاً." : "A server error occurred. Please try again later.";
      toast.error(msg, { id: "global-500" });
    }
    return Promise.reject(error);
  }
);

export function setAuthTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearAuthTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem("charityhub-auth-v2");
}

export { TOKEN_KEY, REFRESH_KEY, LOCALE_KEY };
export default api;
