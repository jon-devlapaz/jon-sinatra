/**
 * F07 — calendar math (plain calendar dates, timezone-independent).
 */
import { describe, expect, it } from 'vitest';
import { buildMonthGrid, isoDay, isoMonth, monthLabel, shiftMonth } from '../../src/lib/date-utils';

describe('isoDay / isoMonth', () => {
  it('zero-pads month and day', () => {
    expect(isoDay(2026, 7, 3)).toBe('2026-08-03');
    expect(isoDay(2026, 11, 24)).toBe('2026-12-24');
    expect(isoMonth(2026, 0)).toBe('2026-01');
  });
});

describe('shiftMonth', () => {
  it('wraps across years', () => {
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
  });
  it('stays in place for zero delta', () => {
    expect(shiftMonth(2026, 5, 0)).toEqual({ year: 2026, month: 5 });
  });
});

describe('monthLabel', () => {
  it('renders month + year', () => {
    expect(monthLabel(2026, 7)).toContain('August');
    expect(monthLabel(2026, 7)).toContain('2026');
  });
});

describe('buildMonthGrid', () => {
  it('builds 7-column rows of valid day numbers', () => {
    const grid = buildMonthGrid(2026, 7);
    expect(grid.weeks.every((row) => row.length === 7)).toBe(true);
    const days = grid.weeks.flat();
    expect(days.every((d) => d === null || (d >= 1 && d <= 31))).toBe(true);
    expect(days.filter((d): d is number => d !== null)).toHaveLength(31);
  });

  it('places day 1 on the correct weekday (Aug 1 2026 is a Saturday)', () => {
    const grid = buildMonthGrid(2026, 7);
    expect(grid.weeks[0].indexOf(1)).toBe(6);
  });

  it('handles leap-year February (2024 has 29 days)', () => {
    const grid = buildMonthGrid(2024, 1);
    const days = grid.weeks.flat().filter((d): d is number => d !== null);
    expect(days).toHaveLength(29);
    expect(days.at(-1)).toBe(29);
  });

  it('handles non-leap February (2026 has 28 days)', () => {
    const grid = buildMonthGrid(2026, 1);
    const days = grid.weeks.flat().filter((d): d is number => d !== null);
    expect(days).toHaveLength(28);
  });
});
