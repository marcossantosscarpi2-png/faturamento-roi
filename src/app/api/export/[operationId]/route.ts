import { NextRequest, NextResponse } from 'next/server';
import { getSession, getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOperationStats } from '@/lib/data';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ operationId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const userId = await getCurrentUserId();
  const { operationId } = await params;
  const { searchParams } = new URL(request.url);
  const period = parseInt(searchParams.get('period') || '7', 10);
  const format = searchParams.get('format') || 'xlsx';

  const opWhere: { id: string; userId?: string | null } = { id: operationId };
  if (userId != null) opWhere.userId = userId;
  const operation = await prisma.operation.findFirst({ where: opWhere });
  if (!operation) {
    return NextResponse.json({ error: 'Operação não encontrada' }, { status: 404 });
  }

  const stats = await getOperationStats(operationId, period);

  if (format === 'xlsx') {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['Data', 'Receita', 'Gasto', 'Lucro', 'ROI (x)'],
      ...stats.days.map((d) => [
        d.date,
        d.totalRevenue,
        d.totalExpense,
        d.profit,
        d.roi !== null ? d.roi.toFixed(2) + 'x' : '—',
      ]),
      [],
      ['Totais', stats.totalRevenue, stats.totalExpense, stats.totalProfit, stats.avgRoi !== null ? stats.avgRoi.toFixed(2) + 'x' : '—'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, `${operation.name} - ${period}d`);
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="faturamento-${operation.name.replace(/\s/g, '-')}-${period}d.xlsx"`,
      },
    });
  }

  if (format === 'pdf') {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${operation.name} - Relatório ${period} dias`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);

    const tableData = stats.days.map((d) => [
      new Date(d.date).toLocaleDateString('pt-BR'),
      d.totalRevenue.toFixed(2),
      d.totalExpense.toFixed(2),
      d.profit.toFixed(2),
      d.roi !== null ? d.roi.toFixed(2) + 'x' : '—',
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Data', 'Receita', 'Gasto', 'Lucro', 'ROI']],
      body: tableData,
    });

    const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 35 + (stats.days.length + 1) * 7;
    doc.setFontSize(10);
    doc.text(`Total Receita: R$ ${stats.totalRevenue.toFixed(2)}`, 14, finalY + 10);
    doc.text(`Total Gasto: R$ ${stats.totalExpense.toFixed(2)}`, 14, finalY + 16);
    doc.text(`Lucro: R$ ${stats.totalProfit.toFixed(2)}`, 14, finalY + 22);
    doc.text(`ROI Médio: ${stats.avgRoi !== null ? stats.avgRoi.toFixed(2) + 'x' : '—'}`, 14, finalY + 28);

    const pdfBuf = doc.output('arraybuffer');
    return new NextResponse(pdfBuf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="faturamento-${operation.name.replace(/\s/g, '-')}-${period}d.pdf"`,
      },
    });
  }

  return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
}
