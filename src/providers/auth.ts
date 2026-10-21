import type { AuthProvider } from "@refinedev/core";
import { API_URL } from "@/providers/constants";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  image?: string | null;
};

type SessionResponse = {
  user: AuthUser;
  session: { id: string };
} | null;

const authUrl = `${API_URL}/auth`;

const request = async (path: string, body?: Record<string, unknown>) => {
  const response = await fetch(`${authUrl}/${path}`, {
    method: body ? "POST" : "GET",
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.message ?? payload?.error ?? "Authentication failed";
    throw new Error(message);
  }
  return payload;
};

const getSession = () => request("get-session") as Promise<SessionResponse>;

export const authProvider: AuthProvider = {
  login: async ({ email, password, providerName }) => {
    if (providerName) {
      return {
        success: false,
        error: new Error("Social sign-in is not configured for this project."),
      };
    }

    try {
      await request("sign-in/email", { email, password });
      return { success: true, redirectTo: "/" };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  },
  register: async ({ email, password, name }) => {
    try {
      await request("sign-up/email", {
        email,
        password,
        name: name || String(email).split("@")[0],
      });
      return { success: true, redirectTo: "/" };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  },
  logout: async () => {
    try {
      await request("sign-out", {});
      return { success: true, redirectTo: "/login" };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  },
  check: async () => {
    try {
      const session = await getSession();
      return session
        ? { authenticated: true }
        : { authenticated: false, redirectTo: "/login", logout: true };
    } catch (error) {
      return {
        authenticated: false,
        redirectTo: "/login",
        logout: true,
        error: error as Error,
      };
    }
  },
  getIdentity: async () => {
    const session = await getSession();
    return session?.user ?? null;
  },
  getPermissions: async () => {
    const session = await getSession();
    return session?.user.role ?? null;
  },
  onError: async (error) => ({ error }),
};