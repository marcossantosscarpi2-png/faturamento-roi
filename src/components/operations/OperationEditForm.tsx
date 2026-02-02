'use client';

import { useState, useEffect } from 'react';
import { updateOperation, deleteOperation } from '@/app/actions/operations';
import type { Operation } from '@prisma/client';
import toast from 'react-hot-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { DEFAULT_EXPENSE_CATEGORIES, type ExpenseCategoryItem } from '@/lib/expenseCategories';

export function OperationEditForm({
  operation,
}: {
  operation: Operation;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState<ExpenseCategoryItem[]>([]);

  useEffect(() => {
    if (!operation.expenseCategories) {
      setCategories([...DEFAULT_EXPENSE_CATEGORIES]);
      return;
    }
    try {
      const parsed = JSON.parse(operation.expenseCategories) as ExpenseCategoryItem[];
      setCategories(Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_EXPENSE_CATEGORIES]);
    } catch {
      setCategories([...DEFAULT_EXPENSE_CATEGORIES]);
    }
  }, [operation.expenseCategories]);

  const defaultIds = new Set(DEFAULT_EXPENSE_CATEGORIES.map((c) => c.id));

  function updateCategoryLabel(index: number, label: string) {
    setCategories((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], label };
      return next;
    });
  }

  function addCategory() {
    setCategories((prev) => [
      ...prev,
      { id: `CUSTOM_${Date.now()}`, label: 'Novo gasto' },
    ]);
  }

  function removeCategory(index: number) {
    const id = categories[index]?.id;
    if (id && defaultIds.has(id)) return;
    setCategories((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      formData.set('expenseCategories', JSON.stringify(categories));
      const result = await updateOperation(operation.id, formData);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else if (result?.success) {
        toast.success('Operação atualizada com sucesso!');
        window.location.href = `/operacoes/${operation.id}`;
      }
    } catch (err) {
      toast.error('Erro ao atualizar operação');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Excluir esta operação e todos os lançamentos? Esta ação não pode ser desfeita.')) return;
    setDeleting(true);
    try {
      await deleteOperation(operation.id);
      toast.success('Operação excluída com sucesso!');
      window.location.href = '/';
    } catch (err) {
      toast.error('Erro ao excluir operação');
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            name="name"
            type="text"
            defaultValue={operation.name}
            required
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Orçamento diário (R$)</label>
          <input
            name="dailyBudget"
            type="number"
            step="0.01"
            min="0"
            defaultValue={Number(operation.dailyBudget)}
            required
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Conta PIX</label>
          <input
            name="pixAccount"
            type="text"
            defaultValue={operation.pixAccount}
            required
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Categorias de gasto</label>
            <button
              type="button"
              onClick={addCategory}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Nova categoria
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Altere o nome das categorias ou adicione novas. As categorias padrão (Ads, IA, Chips, Gastos variáveis) não podem ser removidas.
          </p>
          <ul className="space-y-2">
            {categories.map((cat, index) => (
              <li key={cat.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={cat.label}
                  onChange={(e) => updateCategoryLabel(index, e.target.value)}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm"
                  placeholder="Nome da categoria"
                />
                <button
                  type="button"
                  onClick={() => removeCategory(index)}
                  disabled={defaultIds.has(cat.id)}
                  className="rounded p-2 text-destructive hover:bg-destructive/10 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={defaultIds.has(cat.id) ? 'Categorias padrão não podem ser removidas' : 'Remover categoria'}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={loading || deleting}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar'
          )}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={loading || deleting}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading || deleting}
          className="rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {deleting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Excluindo...
            </>
          ) : (
            'Excluir operação'
          )}
        </button>
      </div>
    </form>
  );
}
