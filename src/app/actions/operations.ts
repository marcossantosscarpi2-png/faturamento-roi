'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getExpenseCategories } from '@/lib/expenseCategories';

export async function createOperation(formData: FormData) {
  const name = formData.get('name') as string;
  const dailyBudget = parseFloat((formData.get('dailyBudget') as string) || '0');
  const pixAccount = formData.get('pixAccount') as string;

  if (!name || !pixAccount) {
    return { error: 'Nome e conta PIX são obrigatórios' };
  }

  await prisma.operation.create({
    data: {
      name,
      dailyBudget,
      pixAccount,
    },
  });

  revalidatePath('/');
  return { success: true };
}

export async function updateOperation(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const dailyBudget = parseFloat((formData.get('dailyBudget') as string) || '0');
  const pixAccount = formData.get('pixAccount') as string;
  const expenseCategoriesRaw = formData.get('expenseCategories') as string | null;
  const expenseCategories =
    expenseCategoriesRaw && expenseCategoriesRaw.trim() ? expenseCategoriesRaw.trim() : null;

  if (!name || !pixAccount) {
    return { error: 'Nome e conta PIX são obrigatórios' };
  }

  await prisma.operation.update({
    where: { id },
    data: { name, dailyBudget, pixAccount, expenseCategories },
  });

  revalidatePath('/');
  revalidatePath(`/operacoes/${id}`);
  return { success: true };
}

export async function deleteOperation(id: string) {
  await prisma.operation.delete({ where: { id } });
  revalidatePath('/');
  return { success: true };
}

export async function addExpenseCategory(operationId: string, label: string) {
  const trimmed = (label || '').trim();
  if (!trimmed) return { error: 'Nome da categoria é obrigatório' };

  const operation = await prisma.operation.findUnique({ where: { id: operationId } });
  if (!operation) return { error: 'Operação não encontrada' };

  const current = getExpenseCategories(operation);
  const existingIds = new Set(current.map((c) => c.id));
  const existingLabels = new Set(current.map((c) => c.label.toLowerCase()));

  if (existingLabels.has(trimmed.toLowerCase())) {
    return { error: 'Já existe uma categoria com esse nome' };
  }

  const baseId = trimmed
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '')
    .slice(0, 32) || `CAT_${Date.now()}`;
  let id = baseId;
  let n = 1;
  while (existingIds.has(id)) {
    id = `${baseId}_${n}`;
    n += 1;
  }

  const newCategories = [...current, { id, label: trimmed }];
  await prisma.operation.update({
    where: { id: operationId },
    data: { expenseCategories: JSON.stringify(newCategories) },
  });

  revalidatePath('/');
  revalidatePath(`/operacoes/${operationId}`);
  return { success: true, category: { id, label: trimmed } };
}
