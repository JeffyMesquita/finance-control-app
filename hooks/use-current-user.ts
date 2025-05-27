"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/supabase/database.types";
import { supabaseCache } from "@/lib/supabase/cache";

const CACHE_KEY = "current-user";
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // Aumentado para 2 segundos
const MIN_REQUEST_INTERVAL = 10000; // Aumentado para 10 segundos
const CACHE_DURATION = 300000; // 5 minutos em cache

// Sistema de fila para requisições
let requestQueue: Array<() => Promise<any>> = [];
let isProcessingQueue = false;

// Lock para evitar múltiplos fetches simultâneos
let fetchPromise: Promise<any> | null = null;
let lastFetchTime = 0;

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;

  isProcessingQueue = true;
  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) {
      try {
        await request();
      } catch (error) {
        console.error("Erro ao processar requisição:", error);
      }
      // Aguarda o intervalo mínimo entre requisições
      await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL));
    }
  }
  isProcessingQueue = false;
}

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const supabase = createClientComponentClient<Database>();
  const isMounted = useRef(true);

  const fetchUser = useCallback(
    async (force = false) => {
      // Verificar cache primeiro
      if (!force) {
        const cachedUser = supabaseCache.get(CACHE_KEY);
        if (cachedUser) {
          const cacheTime =
            (supabaseCache.get(`${CACHE_KEY}_time`) as number) || 0;
          if (Date.now() - cacheTime < CACHE_DURATION) {
            setUser(cachedUser);
            setLoading(false);
            return cachedUser;
          }
        }
      }

      // Verificar intervalo mínimo entre requisições
      const now = Date.now();
      if (!force && now - lastFetchTime < MIN_REQUEST_INTERVAL) {
        const cachedUser = supabaseCache.get(CACHE_KEY);
        if (cachedUser) {
          setUser(cachedUser);
          setLoading(false);
          return cachedUser;
        }
      }

      setLoading(true);
      setError(null);

      // Adicionar requisição à fila
      return new Promise((resolve, reject) => {
        requestQueue.push(async () => {
          try {
            if (fetchPromise) {
              const result = await fetchPromise;
              if (isMounted.current) {
                setUser(result);
                setLoading(false);
              }
              resolve(result);
              return;
            }

            fetchPromise = (async () => {
              let lastError = null;
              for (let i = 0; i < MAX_RETRIES; i++) {
                try {
                  const {
                    data: { user },
                    error,
                  } = await supabase.auth.getUser();

                  if (user) {
                    lastFetchTime = Date.now();
                    supabaseCache.set(CACHE_KEY, user);
                    supabaseCache.set(`${CACHE_KEY}_time`, Date.now());
                    return user;
                  }

                  if (error) {
                    if (error.status === 429) {
                      lastError = error;
                      await new Promise((res) =>
                        setTimeout(res, RETRY_DELAY * Math.pow(2, i))
                      );
                      continue;
                    }
                    lastError = error;
                    break;
                  }
                } catch (err) {
                  lastError = err;
                  break;
                }
              }
              throw lastError;
            })();

            const result = await fetchPromise;
            if (isMounted.current) {
              setUser(result);
              setLoading(false);
            }
            fetchPromise = null;
            resolve(result);
          } catch (err) {
            if (isMounted.current) {
              setError(err);
              setLoading(false);
            }
            fetchPromise = null;
            reject(err);
          }
        });

        processQueue();
      });
    },
    [supabase]
  );

  useEffect(() => {
    isMounted.current = true;
    fetchUser();
    return () => {
      isMounted.current = false;
    };
  }, [fetchUser]);

  const refresh = useCallback(() => {
    supabaseCache.delete(CACHE_KEY);
    supabaseCache.delete(`${CACHE_KEY}_time`);
    fetchUser(true);
  }, [fetchUser]);

  return { user, loading, error, refresh };
}
