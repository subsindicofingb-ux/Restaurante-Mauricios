"use client";

import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from "react";

const KEY = "mauricios-equipe";

export type StaffRole = "admin" | "equipe" | "delivery";

interface StaffSession {
  ready: boolean;
  name: string | null;
  role: StaffRole | null;
  enter: (name: string, role: StaffRole) => void;
  leave: () => void;
}

interface StoredStaff {
  name: string;
  role: StaffRole;
}

function readStaff(): StoredStaff | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredStaff;
    if (parsed?.name && (parsed.role === "admin" || parsed.role === "equipe" || parsed.role === "delivery")) return parsed;
  } catch {
    /* sessão antiga, só com o nome */
  }
  return { name: raw.trim(), role: "equipe" };
}

const Ctx = createContext<StaffSession | null>(null);

export function StaffProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredStaff | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStored(readStaff());
    setReady(true);
  }, []);

  const session: StaffSession = {
    ready,
    name: stored?.name ?? null,
    role: stored?.role ?? null,
    enter(name: string, role: StaffRole) {
      const next = { name: name.trim(), role };
      window.localStorage.setItem(KEY, JSON.stringify(next));
      setStored(next);
    },
    leave() {
      window.localStorage.removeItem(KEY);
      setStored(null);
    },
  };

  return createElement(Ctx.Provider, { value: session }, children);
}

export function useStaffSession() {
  const session = useContext(Ctx);
  if (!session) throw new Error("A sessão da equipe precisa do StaffProvider.");
  return session;
}

export function staffSignedIn() {
  return Boolean(readStaff());
}
