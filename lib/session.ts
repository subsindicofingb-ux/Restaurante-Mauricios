"use client";

import { useEffect, useState } from "react";

const KEY = "mauricios-cliente";

export function useClientSession() {
  const [id, setId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setId(window.localStorage.getItem(KEY));
    setReady(true);
  }, []);

  return {
    ready,
    id,
    enter(next: string) {
      window.localStorage.setItem(KEY, next);
      setId(next);
    },
    leave() {
      window.localStorage.removeItem(KEY);
      setId(null);
    },
  };
}
