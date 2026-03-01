"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { schemas } from "@nestdrive/client";
import { api } from "~/lib/api";
import { getQueryClient } from "~/lib/query";

type User = schemas["User"];

interface AuthContextValue {
  user: User | undefined;
  isLoading: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const hasToken = !!token;

  const {
    data: user,
    isLoading,
    isError,
  } = api.useQuery(
    "get",
    "/v1/users/me",
    {},
    {
      enabled: hasToken,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  );

  useEffect(() => {
    if (!hasToken || !isError) return;
    localStorage.removeItem("token");
    setToken(null);
  }, [hasToken, isError]);

  const signIn = useCallback(
    (nextToken: string) => {
      localStorage.setItem("token", nextToken);
      setToken(nextToken);
      getQueryClient().clear();
      router.replace("/");
    },
    [router],
  );

  const signOut = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    getQueryClient().clear();
    router.replace("/login");
  }, [router]);

  const isAuthLoading = token === undefined || (hasToken && isLoading);

  return (
    <AuthContext.Provider
      value={{ user, isLoading: isAuthLoading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
