"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, X, Share2, Twitter, Facebook, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/supabase/database.types";
import { getReferralStats } from "@/app/actions/referrals";
import { FaInstagram, FaTelegram, FaWhatsapp } from "react-icons/fa";
import { supabaseCache } from "@/lib/supabase/cache";
import { useCurrentUser } from "@/hooks/use-current-user";

const SESSION_KEY = "shareAlertDismissed";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const CACHE_KEYS = {
  USER: "share-app-alert-user",
  STATS: "share-app-alert-stats",
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function ShareAppAlert() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [inviteCount, setInviteCount] = useState(0);
  const { user, loading: userLoading } = useCurrentUser();
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();
  const [retryCount, setRetryCount] = useState(0);
  const [referralStats, setReferralStats] = useState<{
    totalReferrals: number;
    activeReferrals: number;
  } | null>(null);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem(SESSION_KEY, "true");
  };

  const fetchUser = useCallback(async () => {
    try {
      // Check cache first
      const cachedUser = supabaseCache.get<{ id: string }>(CACHE_KEYS.USER);
      if (cachedUser) {
        setUserId(cachedUser.id);
        return;
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        if (error.status === 429 && retryCount < MAX_RETRIES) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            fetchUser();
          }, RETRY_DELAY);
          return;
        }
        throw error;
      }

      if (user) {
        setUserId(user.id);
        // Cache the user data
        supabaseCache.set(CACHE_KEYS.USER, { id: user.id });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do usuário.",
        variant: "destructive",
      });
    }
  }, [supabase, retryCount, toast]);

  const fetchStats = useCallback(async () => {
    if (!userId) return;

    try {
      // Check cache first
      const cachedStats = supabaseCache.get<{
        totalReferrals: number;
        activeReferrals: number;
      }>(CACHE_KEYS.STATS);

      if (cachedStats) {
        setReferralStats(cachedStats);
        setInviteCount(cachedStats.totalReferrals);
        setIsLoading(false);
        return;
      }

      const stats = await getReferralStats();
      const formattedStats = {
        totalReferrals: stats.referralCount,
        activeReferrals: stats.badges.length,
      };
      setReferralStats(formattedStats);
      setInviteCount(stats.referralCount);
      // Cache the stats
      supabaseCache.set(CACHE_KEYS.STATS, formattedStats);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas de indicação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase, retryCount, toast]);

  useEffect(() => {
    const sessionKey = localStorage.getItem("supabase.auth.token");
    const isDismissed = localStorage.getItem(SESSION_KEY) === "true";
    setVisible(!!sessionKey && !isDismissed);
  }, []);

  useEffect(() => {
    if (visible && user && !userLoading) {
      setUserId(user.id);
    }
  }, [visible, user, userLoading]);

  useEffect(() => {
    if (userId) {
      fetchStats();
    }
  }, [userId, fetchStats]);

  const getShareUrl = useCallback(() => {
    if (!userId) return BASE_URL;
    return `${BASE_URL}?ref=${userId}`;
  }, [userId]);

  const handleCopy = useCallback(async () => {
    try {
      const shareUrl = getShareUrl();
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "🔗 Link copiado!",
        description:
          "Link de convite copiado com sucesso! Compartilhe com seus amigos! 🚀",
        variant: "info",
      });
    } catch (error) {
      console.error("Erro ao copiar link:", error);
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link",
        variant: "destructive",
      });
    }
  }, [getShareUrl, toast]);

  const handleSocialShare = useCallback(
    (platform: string) => {
      const shareUrl = getShareUrl();
      const text = "Venha descomplicar sua vida financeira comigo! 🚀";

      const urls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(shareUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareUrl
        )}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
        instagram: `https://www.instagram.com/share?url=${encodeURIComponent(
          shareUrl
        )}`,
      };

      window.open(urls[platform as keyof typeof urls], "_blank");
    },
    [getShareUrl]
  );

  if (!visible || !userId || isLoading) return null;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.98 }}
          transition={{ duration: 1, type: "tween", ease: "easeInOut" }}
        >
          <Card className="border-blue-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 relative shadow-lg">
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 text-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800"
              onClick={handleClose}
              aria-label="Fechar alerta"
            >
              <X className="w-4 h-4" />
            </Button>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Share2 className="w-5 h-5 animate-bounce text-blue-600" />
              <CardTitle className="text-blue-900 dark:text-blue-200 text-lg font-bold">
                Compartilhe o app e ganhe distintivos! 🏆
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-900 dark:text-blue-100">
                Você já trouxe {inviteCount} amigos para descomplicar a vida
                financeira! Continue compartilhando e ganhe distintivos
                exclusivos! 🚀
                <br />
                <span className="inline-flex items-center gap-2 mt-2">
                  <span className="font-mono bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-blue-900 dark:text-blue-100 select-all">
                    {getShareUrl()}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-blue-700 text-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 flex-shrink-0"
                    onClick={handleCopy}
                    aria-label="Copiar link de convite"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </span>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-blue-700 text-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
                    onClick={() => handleSocialShare("twitter")}
                    aria-label="Compartilhar no Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-blue-700 text-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
                    onClick={() => handleSocialShare("facebook")}
                    aria-label="Compartilhar no Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-blue-700 text-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
                    onClick={() => handleSocialShare("linkedin")}
                    aria-label="Compartilhar no LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-blue-700 text-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
                    onClick={() => handleSocialShare("telegram")}
                    aria-label="Compartilhar no Telegram"
                  >
                    <FaTelegram className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-blue-700 text-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
                    onClick={() => handleSocialShare("whatsapp")}
                    aria-label="Compartilhar no WhatsApp"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-blue-700 text-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
                    onClick={() => handleSocialShare("instagram")}
                    aria-label="Compartilhar no Instagram"
                  >
                    <FaInstagram className="w-4 h-4" />
                  </Button>
                </div>
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
