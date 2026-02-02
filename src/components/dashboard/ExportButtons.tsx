'use client';

import { FileSpreadsheet, FileText } from 'lucide-react';

export function ExportButtons({
  operationId,
  period,
}: {
  operationId: string;
  period: number;
}) {
  function handleExport(format: 'xlsx' | 'pdf') {
    window.open(`/api/export/${operationId}?period=${period}&format=${format}`, '_blank');
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <button
        type="button"
        onClick={() => handleExport('xlsx')}
        className="min-h-[44px] rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted flex items-center justify-center gap-2"
        aria-label="Exportar para Excel"
      >
        <FileSpreadsheet className="h-4 w-4" aria-hidden />
        Exportar Excel
      </button>
      <button
        type="button"
        onClick={() => handleExport('pdf')}
        className="min-h-[44px] rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted flex items-center justify-center gap-2"
        aria-label="Exportar para PDF"
      >
        <FileText className="h-4 w-4" aria-hidden />
        Exportar PDF
      </button>
    </div>
  );
}
