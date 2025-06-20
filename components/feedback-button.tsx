"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackDialog } from "@/components/feedback-dialog";

export function FeedbackButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <FeedbackDialog>
        <Button
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">Feedback</span>
        </Button>
      </FeedbackDialog>
    </div>
  );
}

// Versão compacta para usar em menus ou toolbars
export function FeedbackButtonCompact() {
  return (
    <FeedbackDialog>
      <Button variant="ghost" size="sm" className="gap-2">
        <MessageSquare className="h-4 w-4" />
        Enviar Feedback
      </Button>
    </FeedbackDialog>
  );
}

// Versão para menu dropdown
export function FeedbackMenuItem() {
  return (
    <FeedbackDialog>
      <div className="flex w-full items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-muted rounded-sm">
        <MessageSquare className="h-4 w-4 mr-2" />
        Enviar Feedback
      </div>
    </FeedbackDialog>
  );
}
