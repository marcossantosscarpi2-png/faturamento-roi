'use client';

import { useState } from 'react';
import { createOperation } from '@/app/actions/operations';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { operationSchema } from '@/lib/validations';

export function OperationForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const name = (formData.get('name') as string)?.trim();
    const dailyBudget = formData.get('dailyBudget') as string;
    const pixAccount = (formData.get('pixAccount') as string)?.trim();

    const parsed = operationSchema.safeParse({
      name: name || '',
      dailyBudget: dailyBudget ?? '',
      pixAccount: pixAccount || '',
    });
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = first.name?.[0] ?? first.dailyBudget?.[0] ?? first.pixAccount?.[0] ?? 'Verifique os campos.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const result = await createOperation(formData);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else if (result?.success) {
        toast.success('Operação criada com sucesso!');
        window.location.href = '/';
      }
    } catch (err) {
      toast.error('Erro ao criar operação');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="rounded-xl border bg-card p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            name="name"
            type="text"
            required
            className="w-full rounded-lg border px-4 py-2"
            placeholder="Ex: Loja Virtual A"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Orçamento diário (R$)</label>
          <input
            name="dailyBudget"
            type="number"
            step="0.01"
            min="0"
            required
            className="w-full rounded-lg border px-4 py-2"
            placeholder="260"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Conta PIX</label>
          <input
            name="pixAccount"
            type="text"
            required
            className="w-full rounded-lg border px-4 py-2"
            placeholder="Email, CPF ou chave aleatória"
          />
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <div className="mt-6 flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            'Criar operação'
          )}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={loading}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
