import type { GhostRecord } from './record';

export interface DayExport {
  day: string;
  courseVersion: string;
  runs: readonly GhostRecord[];
}

export function dayExportFileName(day: string): string {
  return `ghost-relay-${day}.json`;
}

export function downloadDay(data: DayExport, doc: Document = document): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = doc.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = dayExportFileName(data.day);
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
