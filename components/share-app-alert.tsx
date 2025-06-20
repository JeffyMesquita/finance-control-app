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
import { getReferralStats } from "@/app/actions/referrals";
import { FaInstagram, FaTelegram, FaWhatsapp } from "react-icons/fa";
import { useCurrentUser } from "@/hooks/use-current-user";

const SESSION_KEY = "shareAlertDismissed";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export function ShareAppAlert() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [inviteCount, setInviteCount] = useState(0);
  const { user, loading: userLoading } = useCurrentUser();
  const [referralStats, setReferralStats] = useState<{
    totalReferrals: number;
    activeReferrals: number;
    referrer?: { id: string; email?: string } | null;
  } | null>(null);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem(SESSION_KEY, "true");
  };

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      const stats = await getReferralStats();
      const formattedStats = {
        totalReferrals: stats?.referralCount,
        activeReferrals: stats?.badges.length,
        referrer: stats?.referrer,
      };
      setReferralStats(formattedStats);
      setInviteCount(stats?.referralCount);
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
  }, [user, toast]);

  useEffect(() => {
    const isDismissed = localStorage.getItem(SESSION_KEY) === "true";
    setVisible(!isDismissed);
  }, []);

  useEffect(() => {
    if (user && !userLoading) {
      fetchStats();
    }
  }, [user, userLoading, fetchStats]);

  const getShareUrl = useCallback(() => {
    if (!user) return BASE_URL;
    return `${BASE_URL}/login?ref=${user.id}`;
  }, [user]);

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

  if (!visible || !user || isLoading || userLoading) return null;

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
                {inviteCount > 0 ? (
                  <p>
                    Você já trouxe <b>{inviteCount}</b> amigos para a revolução
                    financeira! 🥳
                    <br />
                    Continue espalhando a palavra e colecione distintivos
                    exclusivos! 🚀🏅
                    <br />
                    Quem compartilha, brilha! ✨
                  </p>
                ) : (
                  <p>
                    Que tal ser o herói financeiro do seu grupo? 🦸‍♂️💸
                    <br />
                    Compartilhe o app com seus amigos e desbloqueie distintivos
                    incríveis! 🏅🎉
                    <br />
                    Quanto mais amigos, mais diversão (e conquistas)! 😄🤝
                  </p>
                )}

                {/* Exibe quem te indicou, se houver */}
                {referralStats?.referrer && (
                  <div className="mt-2 text-blue-800 dark:text-blue-200 text-sm">
                    <b>Você foi indicado por:</b>{" "}
                    {referralStats.referrer.email || referralStats.referrer.id}
                  </div>
                )}

                <br />
                <span className="inline-flex items-center gap-2 mt-2">
                  <span className="font-mono bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-blue-900 dark:text-blue-100 select-all break-all max-w-full overflow-x-auto">
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
                <div className="flex flex-wrap gap-2 mt-4">
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
