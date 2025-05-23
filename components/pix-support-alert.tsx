"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, X, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const PIX_KEY = process.env.NEXT_PUBLIC_PIX_KEY || "";
const SESSION_KEY = "pixAlertDismissed";

export function PixSupportAlert() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Reset dismiss if session changes (simulate by always showing on mount)
    setVisible(
      typeof window !== "undefined" &&
        localStorage.getItem(SESSION_KEY) !== "true"
    );
  }, []);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, "true");
      }
    }, 1000); // match animation duration
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(PIX_KEY);
    toast({
      title: "💸 Pix copiado!",
      description: "Chave Pix copiada com sucesso. Valeu pelo apoio! 💚",
      variant: "info",
    });
  };

  if (!visible || !PIX_KEY) return null;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.98 }}
          transition={{ duration: 1, type: "tween", ease: "easeInOut" }}
        >
          <Card className="mb-4 border-green-700 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 relative shadow-lg">
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 text-green-700 hover:bg-green-200 dark:hover:bg-green-800"
              onClick={handleDismiss}
              aria-label="Fechar alerta"
            >
              <X className="w-4 h-4" />
            </Button>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Zap className="w-5 h-5 animate-spin-slow text-green-600" />
              <CardTitle className="text-green-900 dark:text-green-200 text-lg font-bold">
                Curtiu o app? Ajude com um PIX!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-green-900 dark:text-green-100">
                Se este app te ajudou, que tal retribuir com um cafezinho?{" "}
                <br />
                <span className="inline-flex items-center gap-2 mt-2">
                  <span className="font-mono bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-green-900 dark:text-green-100 select-all">
                    {PIX_KEY}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-green-700 text-green-900 hover:bg-green-200 dark:hover:bg-green-800"
                    onClick={handleCopy}
                    aria-label="Copiar chave PIX"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </span>
                <br />
                <span className="text-xs italic text-green-800 dark:text-green-200">
                  Prometemos que o dinheiro não será usado para comprar pão de
                  queijo... (ou será?) 😜
                </span>
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Animations (add to your global CSS or Tailwind config):
// .animate-fade-in-down { animation: fadeInDown 0.5s; }
// .animate-slide-in { animation: slideIn 0.5s; }
// .animate-bounce-in { animation: bounceIn 0.7s; }
// .animate-spin-slow { animation: spin 2s linear infinite; }
// .animate-fade-in { animation: fadeIn 1s; }
// @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
// @keyframes slideIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
// @keyframes bounceIn { 0% { transform: scale(0.7); } 60% { transform: scale(1.1); } 100% { transform: scale(1); } }
// @keyframes spin { 100% { transform: rotate(360deg); } }
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
// .animate-pix-fade-in { animation: pixFadeIn 0.4s cubic-bezier(0.4,0,0.2,1); }
// .animate-pix-fade-out { animation: pixFadeOut 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
// @keyframes pixFadeIn { from { opacity: 0; transform: translateY(30px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
// @keyframes pixFadeOut { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(-30px) scale(0.97); } }
