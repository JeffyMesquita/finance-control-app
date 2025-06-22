"use client";

import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

export function HeroVisual({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`relative mx-auto w-full max-w-[320px] sm:max-w-[400px] md:max-w-[500px] ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Imagens sobrepostas em formato triangular */}
      <div className="relative h-[180px] sm:h-[250px] md:h-[350px] w-full">
        {/* Imagem 1 (frente) */}
        <div className="absolute top-0 left-0 w-[180px] h-[130px] sm:w-[200px] sm:h-[140px] md:w-[280px] md:h-[200px] bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl overflow-hidden shadow-xl z-30 transform -rotate-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-2 sm:p-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Dashboard de Finanças
              </p>
            </div>
          </div>
        </div>
        {/* Imagem 2 (meio) */}
        <div className="absolute top-[30px] left-[20px] w-[180px] h-[130px] sm:top-[60px] sm:left-[40px] sm:w-[200px] sm:h-[140px] md:top-[60px] md:left-[40px] md:w-[280px] md:h-[200px] bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-2xl overflow-hidden shadow-xl z-20 transform rotate-3">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-2 sm:p-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 rounded-full bg-blue-500/10 flex items-center justify-center">
                <PieChart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Análise de Gastos
              </p>
            </div>
          </div>
        </div>
        {/* Imagem 3 (fundo) */}
        <div className="absolute top-[60px] left-[40px] w-[180px] h-[130px] sm:top-[120px] sm:left-[80px] sm:w-[200px] sm:h-[140px] md:top-[120px] md:left-[80px] md:w-[280px] md:h-[200px] bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-2xl overflow-hidden shadow-xl z-10 transform rotate-12">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-2 sm:p-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Metas Financeiras
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Elementos decorativos */}
      <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] aspect-square bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -z-10 -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
      <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
    </motion.div>
  );
}

