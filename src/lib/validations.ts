import { z } from 'zod';

export const expenseSchema = z.object({
  dailyEntryId: z.string().min(1, 'ID do lançamento é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  description: z.string().optional().nullable(),
  isMonthly: z.enum(['true', 'false']).optional(),
  manualAdjust: z.coerce.number().optional().nullable(),
});

export const revenueSchema = z.object({
  dailyEntryId: z.string().min(1, 'ID do lançamento é obrigatório'),
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  description: z.string().optional().nullable(),
  time: z.string().optional().nullable(),
});

export const operationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  dailyBudget: z.coerce.number().min(0, 'Orçamento deve ser maior ou igual a zero'),
  pixAccount: z.string().min(1, 'Conta PIX é obrigatória'),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
export type RevenueInput = z.infer<typeof revenueSchema>;
export type OperationInput = z.infer<typeof operationSchema>;
