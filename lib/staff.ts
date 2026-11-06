"use client";

import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from "react";

const KEY = "mauricios-equipe";

function storedName() {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(KEY)?.trim();
  return stored || null;
}

interface StaffSession {
  ready: boolean;
  name: string | null;
  enter: (next: string) => void;
  leave: () => void;
}

const Ctx = createContext<StaffSession | null>(null);

export function StaffProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setName(storedName());
    setReady(true);
  }, []);

  const session: StaffSession = {
    ready,
    name,
    enter(next: string) {
      const clean = next.trim();
      window.localStorage.setItem(KEY, clean);
      setName(clean);
    },
    leave() {
      window.localStorage.removeItem(KEY);
      setName(null);
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
  return Boolean(storedName());
}
