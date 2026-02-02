'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

function toLocalDateStr(d: Date | string): string {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function AddDayForm({
  operationId,
  startDate,
  endDate,
}: {
  operationId: string;
  startDate: Date | string;
  endDate: Date | string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const date = (form.elements.namedItem('date') as HTMLInputElement).value;
    if (!date) return;

    setLoading(true);
    try {
      const res = await fetch('/api/entries/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationId, date }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Dia criado com sucesso!');
        setOpen(false);
        router.refresh();
      } else {
        toast.error(data.error || 'Erro ao criar dia');
      }
    } catch (error) {
      toast.error('Erro ao criar dia');
    } finally {
      setLoading(false);
    }
  }

  const minDate = toLocalDateStr(startDate);
  const maxDate = toLocalDateStr(endDate);
  const todayStr = toLocalDateStr(new Date());

  return (
    <div>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          + Novo dia
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            name="date"
            type="date"
            required
            min={minDate}
            max={maxDate}
            defaultValue={todayStr}
            className="rounded border px-2 py-1 text-sm"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="rounded bg-primary px-2 py-1 text-sm text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar'
            )}
          </button>
          <button 
            type="button" 
            onClick={() => setOpen(false)}
            disabled={loading}
            className="rounded border px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </form>
      )}
    </div>
  );
}
