"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/supabase/database.types";
import { supabaseCache } from "@/lib/supabase/cache";

const CACHE_KEY = "current-user";
const CACHE_TIME_KEY = "current-user-time";
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

let fetchPromise: Promise<any> | null = null;
let lastFetchTime = 0;
const MIN_REQUEST_INTERVAL = 10000; // 10 segundos

function getLocalStorageUser() {
  if (typeof window === "undefined") return null;
  try {
    const user = localStorage.getItem(CACHE_KEY);
    const time = localStorage.getItem(CACHE_TIME_KEY);
    if (user && time && Date.now() - Number(time) < CACHE_DURATION) {
      return JSON.parse(user);
    }
  } catch {}
  return null;
}

function setLocalStorageUser(user: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(user));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
  } catch {}
}

function clearLocalStorageUser() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIME_KEY);
  } catch {}
}

export function useCurrentUser() {
  const [user, setUser] = useState<any>(() => getLocalStorageUser());
  const [loading, setLoading] = useState(!getLocalStorageUser());
  const [error, setError] = useState<any>(null);
  const supabase = createClientComponentClient<Database>();
  const isMounted = useRef(true);

  // Atualiza user e cache local, só se mudou
  const updateUser = useCallback((newUser: any) => {
    setUser((prevUser: any) => {
      if (JSON.stringify(prevUser) !== JSON.stringify(newUser)) {
        setLocalStorageUser(newUser);
        supabaseCache.set(CACHE_KEY, newUser);
        supabaseCache.set(CACHE_TIME_KEY, Date.now());
        return newUser;
      }
      return prevUser;
    });
  }, []);

  // Busca user do Supabase se necessário
  const fetchUser = useCallback(
    async (force = false) => {
      if (!force) {
        // 1. Tenta cache localStorage
        const localUser = getLocalStorageUser();
        if (localUser) {
          updateUser(localUser);
          setLoading(false);
          return localUser;
        }
        // 2. Tenta cache global
        const cacheUser = supabaseCache.get(CACHE_KEY);
        const cacheTime = Number(supabaseCache.get(CACHE_TIME_KEY)) || 0;
        if (cacheUser && Date.now() - cacheTime < CACHE_DURATION) {
          updateUser(cacheUser);
          setLoading(false);
          return cacheUser;
        }
      }
      // 3. Throttle para evitar múltiplas requests
      const now = Date.now();
      if (!force && now - lastFetchTime < MIN_REQUEST_INTERVAL) {
        setLoading(false);
        return user;
      }
      setLoading(true);
      setError(null);
      if (fetchPromise) {
        const result = await fetchPromise;
        updateUser(result);
        setLoading(false);
        return result;
      }
      fetchPromise = (async () => {
        try {
          const { data, error } = await supabase.auth.getUser();
          if (error) throw error;
          if (data.user) {
            lastFetchTime = Date.now();
            updateUser(data.user);
            return data.user;
          } else {
            clearLocalStorageUser();
            updateUser(null);
            return null;
          }
        } catch (err) {
          setError(err);
          clearLocalStorageUser();
          updateUser(null);
          return null;
        } finally {
          setLoading(false);
          fetchPromise = null;
        }
      })();
      const result = await fetchPromise;
      return result;
    },
    [supabase, updateUser, user]
  );

  // Sincronização entre abas
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === CACHE_KEY || e.key === CACHE_TIME_KEY) {
        const localUser = getLocalStorageUser();
        setUser((prevUser: any) => {
          if (JSON.stringify(prevUser) !== JSON.stringify(localUser)) {
            return localUser;
          }
          return prevUser;
        });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Atualização automática via onAuthStateChange
  useEffect(() => {
    isMounted.current = true;
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          clearLocalStorageUser();
          updateUser(null);
        } else if (session.user) {
          updateUser(session.user);
        }
      }
    );
    // Primeira busca
    fetchUser();
    return () => {
      isMounted.current = false;
      listener?.subscription.unsubscribe();
    };
  }, [supabase, fetchUser, updateUser]);

  // Forçar refresh manual
  const refresh = useCallback(() => {
    clearLocalStorageUser();
    supabaseCache.delete(CACHE_KEY);
    supabaseCache.delete(CACHE_TIME_KEY);
    fetchUser(true);
  }, [fetchUser]);

  // Função de logout
  const logout = useCallback(async () => {
    clearLocalStorageUser();
    supabaseCache.delete(CACHE_KEY);
    supabaseCache.delete(CACHE_TIME_KEY);
    setUser(null);
    setLoading(false);
    await supabase.auth.signOut();
  }, [supabase]);

  return { user, loading, error, refresh, logout };
}
