'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function createOrGetDailyEntry(operationId: string, date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const entry = await prisma.dailyEntry.upsert({
    where: {
      operationId_date: { operationId, date: d },
    },
    create: { operationId, date: d },
    update: {},
  });
  revalidatePath(`/operacoes/${operationId}`);
  return entry;
}

export async function updateDailyObservations(entryId: string, observations: string | null) {
  await prisma.dailyEntry.update({
    where: { id: entryId },
    data: { observations },
  });
  const entry = await prisma.dailyEntry.findUnique({
    where: { id: entryId },
    include: { operation: true },
  });
  if (entry) revalidatePath(`/operacoes/${entry.operationId}`);
  return { success: true };
}

export async function createExpense(formData: FormData) {
  try {
    const dailyEntryId = formData.get('dailyEntryId') as string;
    const category = formData.get('category') as string;
    const amountStr = formData.get('amount') as string;
    const description = (formData.get('description') as string) || null;
    const isMonthly = formData.get('isMonthly') === 'true';
    const manualAdjust = formData.get('manualAdjust')
      ? parseFloat(formData.get('manualAdjust') as string)
      : null;

    if (!dailyEntryId) return { error: 'ID do lançamento diário é obrigatório' };
    if (!category) return { error: 'Categoria é obrigatória' };
    if (!amountStr || isNaN(parseFloat(amountStr))) return { error: 'Valor inválido' };
    
    const amount = parseFloat(amountStr);
    if (amount <= 0) return { error: 'Valor deve ser maior que zero' };

    const entry = await prisma.dailyEntry.findUnique({
      where: { id: dailyEntryId },
      include: { operation: true },
    });
    if (!entry) return { error: 'Lançamento diário não encontrado' };

    await prisma.expense.create({
      data: {
        dailyEntryId,
        category,
        amount,
        description,
        isMonthly,
        manualAdjust,
      },
    });

    revalidatePath(`/operacoes/${entry.operationId}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar gasto:', error);
    return { error: 'Erro ao criar gasto. Tente novamente.' };
  }
}

export async function updateExpense(
  expenseId: string,
  operationId: string,
  formData: FormData
) {
  try {
    const category = formData.get('category') as string;
    const amountStr = formData.get('amount') as string;
    const description = (formData.get('description') as string) || null;
    const isMonthly = formData.get('isMonthly') === 'true';
    const manualAdjust = formData.get('manualAdjust')
      ? parseFloat(formData.get('manualAdjust') as string)
      : null;

    if (!category) return { error: 'Categoria é obrigatória' };
    if (!amountStr || isNaN(parseFloat(amountStr))) return { error: 'Valor inválido' };
    const amount = parseFloat(amountStr);
    if (amount <= 0) return { error: 'Valor deve ser maior que zero' };

    await prisma.expense.update({
      where: { id: expenseId },
      data: { category, amount, description, isMonthly, manualAdjust },
    });

    revalidatePath(`/operacoes/${operationId}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar gasto:', error);
    return { error: 'Erro ao atualizar gasto. Tente novamente.' };
  }
}

export async function deleteExpense(id: string, operationId: string) {
  try {
    if (!id || !operationId) return { error: 'IDs inválidos' };
    await prisma.expense.delete({ where: { id } });
    revalidatePath(`/operacoes/${operationId}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir gasto:', error);
    return { error: 'Erro ao excluir gasto. Tente novamente.' };
  }
}

export async function createRevenue(formData: FormData) {
  try {
    const dailyEntryId = formData.get('dailyEntryId') as string;
    const amountStr = formData.get('amount') as string;
    const description = (formData.get('description') as string) || null;
    const time = (formData.get('time') as string) || null;

    if (!dailyEntryId) return { error: 'ID do lançamento diário é obrigatório' };
    if (!amountStr || isNaN(parseFloat(amountStr))) return { error: 'Valor inválido' };
    
    const amount = parseFloat(amountStr);
    if (amount <= 0) return { error: 'Valor deve ser maior que zero' };

    const entry = await prisma.dailyEntry.findUnique({
      where: { id: dailyEntryId },
      include: { operation: true },
    });
    if (!entry) return { error: 'Lançamento diário não encontrado' };

    await prisma.revenue.create({
      data: { dailyEntryId, amount, description, time },
    });

    revalidatePath(`/operacoes/${entry.operationId}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar receita:', error);
    return { error: 'Erro ao criar receita. Tente novamente.' };
  }
}

export async function updateRevenue(
  revenueId: string,
  operationId: string,
  formData: FormData
) {
  try {
    const amountStr = formData.get('amount') as string;
    const description = (formData.get('description') as string) || null;
    const time = (formData.get('time') as string) || null;

    if (!amountStr || isNaN(parseFloat(amountStr))) return { error: 'Valor inválido' };
    const amount = parseFloat(amountStr);
    if (amount <= 0) return { error: 'Valor deve ser maior que zero' };

    await prisma.revenue.update({
      where: { id: revenueId },
      data: { amount, description, time },
    });

    revalidatePath(`/operacoes/${operationId}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar receita:', error);
    return { error: 'Erro ao atualizar receita. Tente novamente.' };
  }
}

export async function deleteRevenue(id: string, operationId: string) {
  try {
    if (!id || !operationId) return { error: 'IDs inválidos' };
    await prisma.revenue.delete({ where: { id } });
    revalidatePath(`/operacoes/${operationId}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir receita:', error);
    return { error: 'Erro ao excluir receita. Tente novamente.' };
  }
}

export async function duplicateDay(entryId: string, operationId: string, targetDate: string) {
  try {
    if (!entryId || !operationId || !targetDate) return { error: 'Dados inválidos' };
    const entry = await prisma.dailyEntry.findUnique({
      where: { id: entryId },
      include: { expenses: true, revenues: true, operation: true },
    });
    if (!entry) return { error: 'Lançamento diário não encontrado' };

    const d = new Date(targetDate);
    d.setHours(0, 0, 0, 0);

    const newEntry = await prisma.dailyEntry.create({
      data: {
        operationId,
        date: d,
        observations: entry.observations,
      },
    });

    for (const exp of entry.expenses) {
      await prisma.expense.create({
        data: {
          dailyEntryId: newEntry.id,
          category: exp.category,
          amount: Number(exp.amount),
          description: exp.description,
          isMonthly: exp.isMonthly,
          manualAdjust: exp.manualAdjust ? Number(exp.manualAdjust) : null,
        },
      });
    }
    for (const rev of entry.revenues) {
      await prisma.revenue.create({
        data: {
          dailyEntryId: newEntry.id,
          amount: Number(rev.amount),
          description: rev.description,
          time: rev.time,
        },
      });
    }

    revalidatePath(`/operacoes/${operationId}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao duplicar dia:', error);
    return { error: 'Erro ao duplicar dia. Tente novamente.' };
  }
}

export async function deleteDailyEntry(entryId: string, operationId: string) {
  try {
    if (!entryId || !operationId) return { error: 'IDs inválidos' };
    await prisma.dailyEntry.delete({ where: { id: entryId } });
    revalidatePath(`/operacoes/${operationId}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir lançamento diário:', error);
    return { error: 'Erro ao excluir lançamento diário. Tente novamente.' };
  }
}
