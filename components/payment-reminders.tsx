"use client";

import { logger } from "@/lib/utils/logger";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PaymentReminder {
  id: string;
  title: string;
  amount: number;
  due_date: string;
  is_recurring: boolean;
  category: string;
  status: string;
}

export function PaymentReminders() {
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchReminders();
    setupRealtimeSubscription();
  }, []);

  const fetchReminders = async () => {
    const { data, error } = await supabase
      .from("payment_reminders")
      .select("*")
      .order("due_date", { ascending: true });

    if (error) {
      logger.error("Error fetching reminders:", error);
      return;
    }

    setReminders(data || []);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("payment_reminders_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payment_reminders",
        },
        (payload) => {
          fetchReminders();
        }
      )
      .subscribe();
  };

  const getRemindersForDate = (date: Date) => {
    return reminders.filter(
      (reminder) =>
        format(new Date(reminder.due_date), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
    );
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("payment_reminders")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      logger.error("Error updating status:", error);
    }
  };

  return (
    <Card className="p-4">
      <h2 className="text-2xl font-bold mb-4">Lembretes de Pagamento</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={ptBR}
            className="rounded-md border"
          />
        </div>

        <div className="space-y-4 w-full md:col-span-2">
          {selectedDate && (
            <>
              <h3 className="text-lg font-semibold">
                Pagamentos para{" "}
                {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
              </h3>

              {reminders.length > 0 ? (
                getRemindersForDate(selectedDate).map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-3 bg-stone-100 dark:bg-stone-800 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{reminder.title}</h4>
                      <p className="text-sm text-stone-600 dark:text-stone-400">
                        R$ {reminder.amount.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          reminder.status === "pending"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {reminder.status === "pending" ? "Pendente" : "Pago"}
                      </Badge>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleStatusChange(
                            reminder.id,
                            reminder.status === "pending" ? "paid" : "pending"
                          )
                        }
                      >
                        {reminder.status === "pending"
                          ? "Marcar como Pago"
                          : "Marcar como Pendente"}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-center text-stone-600 dark:text-stone-400">
                    Nenhum lembrete de pagamento encontrado.
                  </p>
                  <p className="text-center text-stone-600 dark:text-stone-400">
                    Em breve, você poderá adicionar lembretes de pagamento aqui.
                    Esse recurso está em desenvolvimento.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
