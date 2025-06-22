import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useCurrentUser } from "@/hooks/use-current-user";

const FREQUENCIES = [
  { value: "daily", label: "Diário" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
  { value: "yearly", label: "Anual" },
];

export function AlertReminderModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const { user, loading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setAmount("");
      setDate("");
      setCategory("");
      setIsRecurring(false);
      setFrequency("monthly");
      setError(null);
    }
  }, [open]);

  function handleCurrencyChange(value: number | null) {
    setAmount(value?.toString() || "");
  }

  async function handleSave() {
    setError(null);
    if (!title.trim()) {
      setError("O título é obrigatório.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("O valor deve ser maior que zero.");
      return;
    }
    if (!date) {
      setError("A data de vencimento é obrigatória.");
      return;
    }
    if (!user) {
      setError("Usuário não autenticado.");
      return;
    }

    setLoading(true);
    try {
      const { error: insertError } = await supabase
        .from("payment_reminders")
        .insert({
          user_id: user.id,
          title,
          description,
          amount: parseFloat(amount),
          due_date: date,
          category,
          is_recurring: isRecurring,
          frequency: isRecurring ? frequency : null,
        });

      if (insertError) {
        setError(insertError.message || "Erro ao salvar lembrete.");
        return;
      }
      onClose();
    } catch (error) {
      setError("Erro ao salvar lembrete.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogTitle>Novo Lembrete de Pagamento</DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <CurrencyInput
              id="amount"
              name="amount"
              value={amount ? Number(amount) : 0}
              onValueChange={handleCurrencyChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Data de vencimento</Label>
            <Input
              id="date"
              placeholder="Data de vencimento"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              placeholder="Categoria"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
            <Label htmlFor="is_recurring">Lembrete Recorrente</Label>
          </div>
          {isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" onClick={onClose} variant="outline">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || userLoading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

