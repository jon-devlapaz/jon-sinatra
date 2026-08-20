/**
 * F07 — calendar math as plain calendar dates (year/month/day integers).
 * Deliberately avoids Date/timezone arithmetic so SSR and client output are
 * identical regardless of machine or visitor timezone (roadmap: pin to UTC-safe).
 */
import { format, getDay, getDaysInMonth } from 'date-fns';

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export interface CalendarMonth {
  year: number;
  month: number; // 0-based (Jan = 0)
  isoMonth: string; // 'yyyy-MM'
  label: string; // 'August 2026'
  weeks: (number | null)[][];
}

/** Zero-pad a number to two digits. */
export function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** 'yyyy-MM' for the first day of (year, month). */
export function isoMonth(year: number, month: number): string {
  return `${year}-${pad2(month + 1)}`;
}

/** 'yyyy-MM-dd' for a given calendar day. */
export function isoDay(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

/** Move by `delta` months; day is always clamped to the 1st. */
export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

/** Human label, e.g. 'August 2026'. */
export function monthLabel(year: number, month: number): string {
  return format(new Date(year, month, 1), 'LLLL yyyy');
}

/**
 * Build a grid of up-to-6 rows × 7 columns for the given month.
 * Leading/trailing blanks are `null`; day numbers are calendar dates.
 */
export function buildMonthGrid(year: number, month: number): CalendarMonth {
  const firstWeekday = getDay(new Date(year, month, 1)); // 0 = Sunday
  const daysInMonth = getDaysInMonth(new Date(year, month, 1));
  const weeks: (number | null)[][] = [];
  const week: (number | null)[] = Array<number | null>(firstWeekday).fill(null);
  for (let day = 1; day <= daysInMonth; day++) week.push(day);
  while (week.length) {
    const row = week.splice(0, 7);
    weeks.push([...row, ...Array(7 - row.length).fill(null)]);
  }
  return {
    year,
    month,
    isoMonth: isoMonth(year, month),
    label: monthLabel(year, month),
    weeks,
  };
}
