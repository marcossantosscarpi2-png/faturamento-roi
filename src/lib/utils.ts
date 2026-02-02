import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function formatROIx(value: number): string {
  return `${value.toFixed(2)}x`;
}

// ROI em X: Receita / Gasto (retorno por real gasto). Se gasto = 0, retorna null
export function calculateROI(revenue: number, expense: number): number | null {
  if (expense <= 0) return null;
  return revenue / expense;
}
