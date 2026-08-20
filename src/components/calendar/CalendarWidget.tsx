/**
 * F07 — Availability calendar (React island, LG3).
 * SSR-renders the same month grid as the LG2 shell; hydrates to interactive.
 * Writes the chosen date into the URL (?date=YYYY-MM-DD#booking) and emits a
 * `jon:date-selected` custom event so the F08 island can prefill live.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WEEKDAY_LABELS, buildMonthGrid, isoDay, shiftMonth } from '../../lib/date-utils';
import { addDays } from 'date-fns';

export interface CalendarWidgetProps {
  /** 'yyyy-MM' of the month to show first (build-time current month). */
  initialIsoMonth: string;
  /** ISO dates already booked — not selectable. */
  bookedDates?: string[];
  /** Optional callback for the selected date (tests). */
  onSelect?: (iso: string) => void;
}

const DATE_EVENT = 'jon:date-selected';

interface DayPos {
  y: number;
  m: number; // 0-based
  d: number;
}

function parseInitialMonth(isoMonth: string): { year: number; month: number } {
  const [y = 0, m = 1] = isoMonth.split('-').map(Number);
  return { year: y, month: m - 1 };
}

const KEY_DELTA: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

function moveBy(iso: string, delta: number): DayPos {
  const [y = 0, m = 1, d = 1] = iso.split('-').map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  const next = addDays(base, delta);
  return { y: next.getUTCFullYear(), m: next.getUTCMonth(), d: next.getUTCDate() };
}

export default function CalendarWidget({
  initialIsoMonth,
  bookedDates = [],
  onSelect,
}: CalendarWidgetProps) {
  const [{ year, month }, setView] = useState(() => parseInitialMonth(initialIsoMonth));
  const [focusIso, setFocusIso] = useState<string>(() => isoDay(year, month, 1));
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [todayIso, setTodayIso] = useState<string | null>(null);

  const cellRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const booked = useMemo(() => new Set(bookedDates), [bookedDates]);

  // Hydration-only: mark the visitor's today and reflect a deep-linked ?date=.
  useEffect(() => {
    const now = new Date();
    const local = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate(),
    ).padStart(2, '0')}`;
    setTodayIso(local);
    const params = new URLSearchParams(window.location.search);
    const paramDate = params.get('date');
    if (paramDate) {
      setSelectedIso(paramDate);
      const [py = 0, pm = 1] = paramDate.split('-').map(Number);
      if (py > 0) {
        setView({ year: py, month: pm - 1 });
        setFocusIso(paramDate);
      }
    }
  }, []);

  // Keep keyboard focus on the focused cell whenever it moves.
  useEffect(() => {
    cellRefs.current.get(focusIso)?.focus();
  }, [focusIso]);

  const commitDate = useCallback(
    (iso: string) => {
      setSelectedIso(iso);
      const url = new URL(window.location.href);
      url.searchParams.set('date', iso);
      url.hash = 'booking';
      window.history.replaceState(null, '', url.toString());
      window.dispatchEvent(new CustomEvent<string>(DATE_EVENT, { detail: iso }));
      onSelect?.(iso);
    },
    [onSelect],
  );

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const delta = KEY_DELTA[event.key];
      if (delta === undefined) {
        if (event.key === 'Home') {
          event.preventDefault();
          const first = isoDay(year, month, 1);
          setFocusIso(first);
          return;
        }
        if (event.key === 'End') {
          event.preventDefault();
          const lastDay =
            grid.weeks
              .flat()
              .filter((d): d is number => d !== null)
              .at(-1) ?? 1;
          setFocusIso(isoDay(year, month, lastDay));
          return;
        }
        return; // not a navigation key
      }
      event.preventDefault();
      const next = moveBy(focusIso, delta);
      setView({ year: next.y, month: next.m });
      setFocusIso(isoDay(next.y, next.m, next.d));
    },
    [focusIso, year, month, grid],
  );

  const handleSelect = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, iso: string) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        commitDate(iso);
      }
    },
    [commitDate],
  );

  const goTo = (delta: number) => {
    const { year: y, month: m } = shiftMonth(year, month, delta);
    setView({ year: y, month: m });
    setFocusIso(isoDay(y, m, 1));
  };

  return (
    <div className="calendar-widget">
      <nav
        aria-label="Calendar month"
        className="mt-8 flex items-center justify-between font-sans text-label font-semibold uppercase tracking-[0.18em] text-accent-deep"
      >
        <button
          type="button"
          className="btn btn--ghost inline-block px-2 py-1 text-xs"
          onClick={() => goTo(-1)}
        >
          Prev
        </button>
        <span aria-live="polite">{grid.label}</span>
        <button
          type="button"
          className="btn btn--ghost inline-block px-2 py-1 text-xs"
          onClick={() => goTo(1)}
        >
          Next
        </button>
      </nav>

      <div
        role="grid"
        aria-label="Availability calendar — arrow keys to move, Enter to choose a date"
        className="mt-6 grid grid-cols-7 gap-1 font-sans text-sm"
        onKeyDown={handleKeyDown}
      >
        <div role="row" className="contents">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} role="columnheader" className="py-2 text-center text-accent-deep">
              {label}
            </div>
          ))}
        </div>
        {grid.weeks.map((week, rowIndex) => (
          <div key={`row-${rowIndex}`} role="row" className="contents">
            {week.map((day, cellIndex) => {
              if (day === null) {
                return (
                  <div key={`blank-${rowIndex}-${cellIndex}`} role="gridcell" className="py-2" />
                );
              }
              const iso = isoDay(year, month, day);
              const isBooked = booked.has(iso);
              const isSelected = selectedIso === iso;
              const isToday = todayIso === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  ref={(node) => {
                    if (node) cellRefs.current.set(iso, node);
                    else cellRefs.current.delete(iso);
                  }}
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-disabled={isBooked}
                  tabIndex={focusIso === iso ? 0 : -1}
                  title={isBooked ? 'Already booked' : 'Choose this date'}
                  onClick={() => !isBooked && commitDate(iso)}
                  onKeyDown={(event) => handleSelect(event, iso)}
                  className={[
                    'rounded-md border py-2 text-center transition-colors',
                    isBooked
                      ? 'cursor-not-allowed border-transparent text-ink-faint line-through'
                      : isSelected
                        ? 'border-accent bg-accent text-paper ring-1 ring-accent'
                        : 'border-card-border text-ink hover:bg-accent/10 focus-visible:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    isToday && !isSelected ? 'font-semibold text-accent' : '',
                  ].join(' ')}
                >
                  {day}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <p className="mt-4 font-sans text-label uppercase tracking-[0.18em] text-ink-soft">
        Pick an open date — it prefills the booking form below.
      </p>
    </div>
  );
}
