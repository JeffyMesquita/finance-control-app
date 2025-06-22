"use client";

import { logger } from "@/lib/utils/logger";
import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, X, Heart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const SESSION_KEY = "pixAlertDismissed";
const PIX_KEY = process.env.NEXT_PUBLIC_PIX_KEY || "chave-pix-nao-configurada";

export function PixSupportAlert() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem(SESSION_KEY, "true");
  };

  useEffect(() => {
    const isDismissed = localStorage.getItem(SESSION_KEY) === "true";
    setVisible(!isDismissed);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      toast({
        title: "🔗 Chave PIX copiada!",
        description:
          "Chave PIX copiada com sucesso! Obrigado por apoiar o app! 💚",
        variant: "info",
      });
    } catch (error) {
      logger.error("Erro ao copiar chave PIX:", error);
      toast({
        title: "Erro",
        description: "Não foi possível copiar a chave PIX",
        variant: "destructive",
      });
    }
  }, [toast]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.98 }}
          transition={{ duration: 1, type: "tween", ease: "easeInOut" }}
        >
          <Card className="border-green-700 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 relative shadow-lg">
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 text-green-700 hover:bg-green-200 dark:hover:bg-green-800"
              onClick={handleClose}
              aria-label="Fechar alerta"
            >
              <X className="w-4 h-4" />
            </Button>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Heart className="w-5 h-5 animate-bounce text-green-600" />
              <CardTitle className="text-green-900 dark:text-green-200 text-lg font-bold">
                Gostou do app? Apoie com um PIX! 💚
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-green-900 dark:text-green-100">
                <p>
                  Se este app te ajudou, que tal retribuir com um PIX? Assim
                  você incentiva o desenvolvimento de novas funcionalidades e
                  mantém o projeto vivo! 😄
                  <br />
                  Só não posso prometer que não vou usar o PIX para comprar
                  café! 😂 ou um energético! 🤣
                </p>

                <span className="inline-flex items-center gap-2 mt-2">
                  <span className="font-mono bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-green-900 dark:text-green-100 select-all">
                    {PIX_KEY}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-green-700 text-green-900 hover:bg-green-200 dark:hover:bg-green-800 flex-shrink-0"
                    onClick={handleCopy}
                    aria-label="Copiar chave PIX"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </span>
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
