import { useEffect, useState, useRef, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/supabase/database.types";
import { supabaseCache } from "@/lib/supabase/cache";

const CACHE_KEY = "current-user";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Lock para evitar múltiplos fetches simultâneos
let fetchPromise: Promise<any> | null = null;

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const supabase = createClientComponentClient<Database>();
  const isMounted = useRef(true);

  const fetchUser = useCallback(
    async (force = false) => {
      setLoading(true);
      setError(null);
      try {
        // Cache global
        if (!force) {
          const cachedUser = supabaseCache.get(CACHE_KEY);
          if (cachedUser) {
            setUser(cachedUser);
            setLoading(false);
            return cachedUser;
          }
        }
        // Lock para evitar múltiplos fetches
        if (fetchPromise) {
          const result = await fetchPromise;
          setUser(result);
          setLoading(false);
          return result;
        }
        fetchPromise = (async () => {
          let lastError = null;
          for (let i = 0; i < MAX_RETRIES; i++) {
            const {
              data: { user },
              error,
            } = await supabase.auth.getUser();
            if (user) {
              supabaseCache.set(CACHE_KEY, user);
              return user;
            }
            if (error && error.status === 429) {
              lastError = error;
              await new Promise((res) =>
                setTimeout(res, RETRY_DELAY * (i + 1))
              );
              continue;
            }
            if (error) {
              lastError = error;
              break;
            }
          }
          throw lastError;
        })();
        const result = await fetchPromise;
        setUser(result);
        setLoading(false);
        fetchPromise = null;
        return result;
      } catch (err) {
        setError(err);
        setLoading(false);
        fetchPromise = null;
        return null;
      }
    },
    [supabase]
  );

  // Montagem/desmontagem
  useEffect(() => {
    isMounted.current = true;
    fetchUser();
    return () => {
      isMounted.current = false;
    };
  }, [fetchUser]);

  // Função para forçar refresh
  const refresh = useCallback(() => {
    supabaseCache.delete(CACHE_KEY);
    fetchUser(true);
  }, [fetchUser]);

  return { user, loading, error, refresh };
}
