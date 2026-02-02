'use client';

import { formatBRL } from '@/lib/utils';
import {
  createExpense,
  createRevenue,
  deleteDailyEntry,
  deleteExpense,
  deleteRevenue,
  updateDailyObservations,
  updateExpense,
  updateRevenue,
  duplicateDay,
} from '@/app/actions/entries';
import { addExpenseCategory } from '@/app/actions/operations';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Pencil, Copy, Plus } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface Expense {
  id: string;
  category: string;
  amount: number | { toNumber?: () => number };
  description: string | null;
  isMonthly: boolean;
  manualAdjust: number | { toNumber?: () => number } | null;
}

interface Revenue {
  id: string;
  amount: number | { toNumber?: () => number };
  description: string | null;
  time: string | null;
}

interface DailyEntry {
  id: string;
  date: Date;
  observations: string | null;
  expenses: Expense[];
  revenues: Revenue[];
}

function toNum(v: number | { toNumber?: () => number } | null): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  return v.toNumber?.() ?? Number(v);
}

export function DailyEntryCard({
  entry,
  operationId,
  categories,
}: {
  entry: DailyEntry;
  operationId: string;
  categories: readonly { value: string; label: string }[];
}) {
  const router = useRouter();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showRevenueForm, setShowRevenueForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingRevenueId, setEditingRevenueId] = useState<string | null>(null);
  const [observations, setObservations] = useState(entry.observations ?? '');
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'expense' | 'revenue' | 'day'; id?: string } | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateTargetDate, setDuplicateTargetDate] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [loadingNewCategory, setLoadingNewCategory] = useState(false);

  const dateStr = new Date(entry.date).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const totalExpense = entry.expenses.reduce((s, e) => {
    const amt = toNum(e.amount);
    const adj = toNum(e.manualAdjust);
    if (e.isMonthly) {
      const days = new Date(entry.date).getDate();
      const daysInMonth = new Date(new Date(entry.date).getFullYear(), new Date(entry.date).getMonth() + 1, 0).getDate();
      return s + (amt / daysInMonth) + adj;
    }
    return s + amt + adj;
  }, 0);

  const totalRevenue = entry.revenues.reduce((s, r) => s + toNum(r.amount), 0);
  const profit = totalRevenue - totalExpense;
  const roi = totalExpense > 0 ? totalRevenue / totalExpense : null; // ROI em X

  async function handleAddExpense(formData: FormData) {
    setLoading('expense');
    try {
      formData.set('dailyEntryId', entry.id);
      const result = await createExpense(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Gasto adicionado com sucesso!');
        setShowExpenseForm(false);
        router.refresh();
      }
    } catch (error) {
      toast.error('Erro ao adicionar gasto');
    } finally {
      setLoading(null);
    }
  }

  async function handleAddRevenue(formData: FormData) {
    setLoading('revenue');
    try {
      formData.set('dailyEntryId', entry.id);
      const result = await createRevenue(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Receita adicionada com sucesso!');
        setShowRevenueForm(false);
        router.refresh();
      }
    } catch (error) {
      toast.error('Erro ao adicionar receita');
    } finally {
      setLoading(null);
    }
  }

  async function handleUpdateExpense(expenseId: string, formData: FormData) {
    setLoading(`edit-${expenseId}`);
    try {
      const result = await updateExpense(expenseId, operationId, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Gasto atualizado!');
        setEditingExpenseId(null);
        router.refresh();
      }
    } catch (error) {
      toast.error('Erro ao atualizar gasto');
    } finally {
      setLoading(null);
    }
  }

  async function handleDeleteExpense(id: string) {
    setConfirmDelete({ type: 'expense', id });
  }

  async function handleConfirmDeleteExpense() {
    if (!confirmDelete?.id || confirmDelete.type !== 'expense') return;
    setLoading(`expense-${confirmDelete.id}`);
    try {
      await deleteExpense(confirmDelete.id, operationId);
      toast.success('Gasto excluído com sucesso!');
      setConfirmDelete(null);
      router.refresh();
    } catch (error) {
      toast.error('Erro ao excluir gasto');
    } finally {
      setLoading(null);
    }
  }

  async function handleDeleteRevenue(id: string) {
    setConfirmDelete({ type: 'revenue', id });
  }

  async function handleConfirmDeleteRevenue() {
    if (!confirmDelete?.id || confirmDelete.type !== 'revenue') return;
    setLoading(`revenue-${confirmDelete.id}`);
    try {
      await deleteRevenue(confirmDelete.id, operationId);
      toast.success('Receita excluída com sucesso!');
      setConfirmDelete(null);
      router.refresh();
    } catch (error) {
      toast.error('Erro ao excluir receita');
    } finally {
      setLoading(null);
    }
  }

  async function handleUpdateRevenue(revenueId: string, formData: FormData) {
    setLoading(`edit-revenue-${revenueId}`);
    try {
      const result = await updateRevenue(revenueId, operationId, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Receita atualizada!');
        setEditingRevenueId(null);
        router.refresh();
      }
    } catch (error) {
      toast.error('Erro ao atualizar receita');
    } finally {
      setLoading(null);
    }
  }

  async function handleDuplicateDay() {
    if (!duplicateTargetDate) {
      toast.error('Selecione a data de destino.');
      return;
    }
    setLoading('duplicate');
    try {
      const result = await duplicateDay(entry.id, operationId, duplicateTargetDate);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Dia duplicado com sucesso!');
        setShowDuplicateModal(false);
        setDuplicateTargetDate('');
        router.refresh();
      }
    } catch (error) {
      toast.error('Erro ao duplicar dia');
    } finally {
      setLoading(null);
    }
  }

  async function handleAddCategory() {
    const label = newCategoryLabel.trim();
    if (!label) {
      toast.error('Digite o nome da categoria.');
      return;
    }
    setLoadingNewCategory(true);
    try {
      const result = await addExpenseCategory(operationId, label);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Categoria "${result.category?.label}" adicionada. Selecione-a no campo acima.`);
        setNewCategoryLabel('');
        setShowNewCategory(false);
        router.refresh();
      }
    } catch (error) {
      toast.error('Erro ao adicionar categoria');
    } finally {
      setLoadingNewCategory(false);
    }
  }

  async function handleObservationsBlur() {
    if (observations === (entry.observations ?? '')) return;
    setLoading('observations');
    try {
      await updateDailyObservations(entry.id, observations || null);
      toast.success('Observações salvas!');
      router.refresh();
    } catch (error) {
      toast.error('Erro ao salvar observações');
    } finally {
      setLoading(null);
    }
  }

  function handleDeleteDayClick() {
    setConfirmDelete({ type: 'day' });
  }

  async function handleConfirmDeleteDay() {
    setLoading('delete-day');
    try {
      await deleteDailyEntry(entry.id, operationId);
      toast.success('Dia excluído com sucesso!');
      setConfirmDelete(null);
      router.refresh();
    } catch (error) {
      toast.error('Erro ao excluir dia');
    } finally {
      setLoading(null);
    }
  }

  const entryDateStr = new Date(entry.date).toISOString().slice(0, 10);
  const nextDay = new Date(entry.date);
  nextDay.setDate(nextDay.getDate() + 1);
  const minDuplicateDate = nextDay.toISOString().slice(0, 10);

  return (
    <div className="rounded-xl border bg-card p-4 transition-smooth hover:shadow-md animate-fade-in">
      <ConfirmDialog
        open={confirmDelete?.type === 'expense' && confirmDelete.id !== undefined}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Excluir gasto"
        description="Tem certeza que deseja excluir este gasto?"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDeleteExpense}
        loading={confirmDelete?.id ? loading === `expense-${confirmDelete.id}` : false}
      />
      <ConfirmDialog
        open={confirmDelete?.type === 'revenue' && confirmDelete.id !== undefined}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Excluir receita"
        description="Tem certeza que deseja excluir esta receita?"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDeleteRevenue}
        loading={confirmDelete?.id ? loading === `revenue-${confirmDelete.id}` : false}
      />
      <ConfirmDialog
        open={confirmDelete?.type === 'day'}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Excluir dia inteiro"
        description="Todos os gastos e receitas deste dia serão removidos. Esta ação não pode ser desfeita."
        confirmLabel="Excluir dia"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDeleteDay}
        loading={loading === 'delete-day'}
      />

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium">{dateStr}</h4>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleDeleteDayClick}
              disabled={loading === 'delete-day'}
              className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:py-0.5"
              title="Excluir dia inteiro"
              aria-label="Excluir dia inteiro"
            >
              {loading === 'delete-day' ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir dia'
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowDuplicateModal(true)}
              disabled={loading === 'duplicate'}
              className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 flex items-center gap-1 sm:py-0.5"
              title="Duplicar dia para outra data"
              aria-label="Duplicar dia"
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Duplicar</span>
            </button>
          </div>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-emerald-600">Receita: {formatBRL(totalRevenue)}</span>
          <span className="text-destructive">Gasto: {formatBRL(totalExpense)}</span>
          <span className={profit >= 0 ? 'text-emerald-600' : 'text-destructive'}>
            Lucro: {formatBRL(profit)}
          </span>
          <span>ROI: {roi !== null ? `${roi.toFixed(2)}x` : '—'}</span>
        </div>
      </div>

      <div className="mt-2">
        <label htmlFor={`obs-${entry.id}`} className="block text-xs font-medium text-muted-foreground">Observações</label>
        <div className="relative">
          <input
            id={`obs-${entry.id}`}
            type="text"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            onBlur={handleObservationsBlur}
            disabled={loading === 'observations'}
            className="mt-1 w-full rounded border px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed pr-8"
            placeholder="Notas do dia..."
            aria-describedby={loading === 'observations' ? `obs-loading-${entry.id}` : undefined}
          />
          {loading === 'observations' && (
            <Loader2 id={`obs-loading-${entry.id}`} className="absolute right-2 top-3 h-3 w-3 animate-spin text-muted-foreground" aria-hidden />
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium">Gastos</h5>
            {!showExpenseForm && (
              <button
                type="button"
                onClick={() => setShowExpenseForm(true)}
                className="text-xs text-primary hover:underline"
              >
                + Adicionar
              </button>
            )}
          </div>
          <ul className="mt-1 space-y-1 text-sm">
            {entry.expenses.map((e) => {
              const amt = toNum(e.amount);
              const adj = toNum(e.manualAdjust);
              const d = new Date(entry.date);
              const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
              const displayAmt = e.isMonthly ? amt / daysInMonth + adj : amt + adj;
              const isEditing = editingExpenseId === e.id;

              if (isEditing) {
                return (
                  <li key={e.id} className="rounded border p-2 space-y-2">
                    <form
                      action={(fd) => handleUpdateExpense(e.id, fd)}
                      className="space-y-2"
                    >
                      <input type="hidden" name="dailyEntryId" value={entry.id} />
                      <div>
                        <label htmlFor={`category-edit-${e.id}`} className="block text-xs font-medium text-muted-foreground mb-0.5">Categoria</label>
                        <select id={`category-edit-${e.id}`} name="category" required className="w-full rounded border px-2 py-1 text-sm" defaultValue={e.category}>
                          {categories.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        {!showNewCategory ? (
                          <button
                            type="button"
                            onClick={() => setShowNewCategory(true)}
                            className="mt-1 text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" aria-hidden />
                            Nova categoria personalizada
                          </button>
                        ) : (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <input
                              type="text"
                              value={newCategoryLabel}
                              onChange={(e) => setNewCategoryLabel(e.target.value)}
                              placeholder="Nome da categoria"
                              className="flex-1 min-w-[120px] rounded border px-2 py-1 text-sm"
                              aria-label="Nome da nova categoria"
                            />
                            <button
                              type="button"
                              onClick={handleAddCategory}
                              disabled={loadingNewCategory || !newCategoryLabel.trim()}
                              className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1"
                            >
                              {loadingNewCategory ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                              Adicionar
                            </button>
                            <button
                              type="button"
                              onClick={() => { setShowNewCategory(false); setNewCategoryLabel(''); }}
                              disabled={loadingNewCategory}
                              className="rounded border px-2 py-1 text-xs"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                      <input
                        name="amount"
                        type="number"
                        step="0.01"
                        required
                        defaultValue={amt}
                        placeholder="Valor (R$)"
                        className="w-full rounded border px-2 py-1 text-sm"
                      />
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          name="isMonthly"
                          type="checkbox"
                          value="true"
                          defaultChecked={e.isMonthly}
                        />
                        Mensal (ratear por dia)
                      </label>
                      <input
                        name="manualAdjust"
                        type="number"
                        step="0.01"
                        defaultValue={adj || ''}
                        placeholder="Ajuste manual (opcional)"
                        className="w-full rounded border px-2 py-1 text-sm"
                      />
                      <input
                        name="description"
                        type="text"
                        defaultValue={e.description ?? ''}
                        placeholder="Descrição (opcional)"
                        className="w-full rounded border px-2 py-1 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={loading === `edit-${e.id}`}
                          className="rounded bg-primary px-2 py-1 text-sm text-primary-foreground disabled:opacity-50 flex items-center gap-1"
                        >
                          {loading === `edit-${e.id}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : null}
                          Salvar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingExpenseId(null)}
                          disabled={loading === `edit-${e.id}`}
                          className="rounded border px-2 py-1 text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </li>
                );
              }

              return (
                <li key={e.id} className="flex items-center justify-between gap-2">
                  <span>
                    {categories.find((c) => c.value === e.category)?.label ?? e.category}: {formatBRL(displayAmt)}
                    {e.isMonthly && ' (mensal)'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingExpenseId(e.id)}
                      className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Editar valor e dados do gasto"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(e.id)}
                      disabled={loading === `expense-${e.id}`}
                      className="text-destructive hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {loading === `expense-${e.id}` ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        'Excluir'
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {showExpenseForm && (
            <form action={handleAddExpense} className="mt-2 space-y-2 rounded border p-2">
              <div>
                <label htmlFor={`category-add-${entry.id}`} className="block text-xs font-medium text-muted-foreground mb-0.5">Categoria</label>
                <select id={`category-add-${entry.id}`} name="category" required className="w-full rounded border px-2 py-1 text-sm">
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                {!showNewCategory ? (
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(true)}
                    className="mt-1 text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" aria-hidden />
                    Nova categoria personalizada
                  </button>
                ) : (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={newCategoryLabel}
                      onChange={(e) => setNewCategoryLabel(e.target.value)}
                      placeholder="Nome da categoria"
                      className="flex-1 min-w-[120px] rounded border px-2 py-1 text-sm"
                      aria-label="Nome da nova categoria"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      disabled={loadingNewCategory || !newCategoryLabel.trim()}
                      className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1"
                    >
                      {loadingNewCategory ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      Adicionar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowNewCategory(false); setNewCategoryLabel(''); }}
                      disabled={loadingNewCategory}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
              <input name="amount" type="number" step="0.01" required placeholder="Valor (R$)" className="w-full rounded border px-2 py-1 text-sm" />
              <label className="flex items-center gap-2 text-sm">
                <input name="isMonthly" type="checkbox" value="true" />
                Mensal (ratear por dia)
              </label>
              <input name="manualAdjust" type="number" step="0.01" placeholder="Ajuste manual (opcional)" className="w-full rounded border px-2 py-1 text-sm" />
              <input name="description" type="text" placeholder="Descrição (opcional)" className="w-full rounded border px-2 py-1 text-sm" />
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={loading === 'expense'}
                  className="rounded bg-primary px-2 py-1 text-sm text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {loading === 'expense' ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowExpenseForm(false)}
                  disabled={loading === 'expense'}
                  className="rounded border px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium">Receita (PIX)</h5>
            {!showRevenueForm && (
              <button
                type="button"
                onClick={() => setShowRevenueForm(true)}
                className="text-xs text-primary hover:underline"
              >
                + Adicionar
              </button>
            )}
          </div>
          <ul className="mt-1 space-y-1 text-sm">
            {entry.revenues.map((r) => {
              const isEditingRevenue = editingRevenueId === r.id;
              if (isEditingRevenue) {
                return (
                  <li key={r.id} className="rounded border p-2 space-y-2">
                    <form
                      action={(fd) => handleUpdateRevenue(r.id, fd)}
                      className="space-y-2"
                    >
                      <label htmlFor={`rev-amount-${r.id}`} className="block text-xs font-medium">Valor (R$)</label>
                      <input
                        id={`rev-amount-${r.id}`}
                        name="amount"
                        type="number"
                        step="0.01"
                        required
                        defaultValue={toNum(r.amount)}
                        className="w-full rounded border px-2 py-1 text-sm"
                      />
                      <label htmlFor={`rev-time-${r.id}`} className="block text-xs font-medium">Horário (opcional)</label>
                      <input
                        id={`rev-time-${r.id}`}
                        name="time"
                        type="time"
                        defaultValue={r.time ?? ''}
                        className="w-full rounded border px-2 py-1 text-sm"
                      />
                      <label htmlFor={`rev-desc-${r.id}`} className="block text-xs font-medium">Descrição (opcional)</label>
                      <input
                        id={`rev-desc-${r.id}`}
                        name="description"
                        type="text"
                        defaultValue={r.description ?? ''}
                        className="w-full rounded border px-2 py-1 text-sm"
                      />
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="submit"
                          disabled={loading === `edit-revenue-${r.id}`}
                          className="min-h-[44px] rounded bg-primary px-2 py-1 text-sm text-primary-foreground disabled:opacity-50 flex items-center gap-1"
                        >
                          {loading === `edit-revenue-${r.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                          Salvar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingRevenueId(null)}
                          disabled={loading === `edit-revenue-${r.id}`}
                          className="min-h-[44px] rounded border px-2 py-1 text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </li>
                );
              }
              return (
                <li key={r.id} className="flex items-center justify-between gap-2">
                  <span>
                    PIX: {formatBRL(toNum(r.amount))}
                    {r.time && <span className="text-muted-foreground ml-2">({r.time})</span>}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingRevenueId(r.id)}
                      className="min-h-[44px] min-w-[44px] rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted sm:min-h-0 sm:min-w-0"
                      title="Editar receita"
                      aria-label="Editar receita"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRevenue(r.id)}
                      disabled={loading === `revenue-${r.id}`}
                      className="min-h-[44px] min-w-[44px] rounded text-destructive hover:underline disabled:opacity-50 flex items-center gap-1 sm:min-h-0 sm:min-w-0"
                      aria-label="Excluir receita"
                    >
                      {loading === `revenue-${r.id}` ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        'Excluir'
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {showRevenueForm && (
            <form action={handleAddRevenue} className="mt-2 space-y-2 rounded border p-2">
              <input name="amount" type="number" step="0.01" required placeholder="Valor (R$)" className="w-full rounded border px-2 py-1 text-sm" />
              <input name="time" type="time" placeholder="Horário (opcional)" className="w-full rounded border px-2 py-1 text-sm" />
              <input name="description" type="text" placeholder="Descrição (opcional)" className="w-full rounded border px-2 py-1 text-sm" />
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={loading === 'revenue'}
                  className="rounded bg-primary px-2 py-1 text-sm text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {loading === 'revenue' ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowRevenueForm(false)}
                  disabled={loading === 'revenue'}
                  className="rounded border px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <Dialog.Root open={showDuplicateModal} onOpenChange={setShowDuplicateModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-lg"
            aria-describedby="duplicate-dialog-description"
          >
            <Dialog.Title className="text-lg font-semibold">Duplicar dia</Dialog.Title>
            <p id="duplicate-dialog-description" className="mt-1 text-sm text-muted-foreground">
              Escolha a data de destino. Gastos e receitas serão copiados.
            </p>
            <div className="mt-4">
              <label htmlFor="duplicate-date" className="block text-sm font-medium mb-1">Data de destino</label>
              <input
                id="duplicate-date"
                type="date"
                value={duplicateTargetDate}
                onChange={(e) => setDuplicateTargetDate(e.target.value)}
                min={minDuplicateDate}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <Dialog.Close asChild>
                <button type="button" className="rounded border px-4 py-2 text-sm font-medium hover:bg-muted min-h-[44px]">
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="button"
                onClick={handleDuplicateDay}
                disabled={loading === 'duplicate' || !duplicateTargetDate}
                className="min-h-[44px] rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading === 'duplicate' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Duplicando...
                  </>
                ) : (
                  'Duplicar'
                )}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
