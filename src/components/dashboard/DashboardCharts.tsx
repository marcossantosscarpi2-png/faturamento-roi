import type { DayStats } from '@/lib/data';
import { DashboardChartsClient } from './DashboardChartsClient';

export function DashboardCharts({ days }: { days: DayStats[] }) {
  return <DashboardChartsClient days={days} />;
}
