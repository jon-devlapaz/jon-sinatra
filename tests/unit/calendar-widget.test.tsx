/**
 * @vitest-environment jsdom
 *
 * F07 — calendar island: month grid, blocked dates, selection wiring
 * (URL + custom event), and keyboard navigation.
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CalendarWidget from '../../src/components/calendar/CalendarWidget';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

beforeEach(() => {
  window.history.replaceState({}, '', '/');
});

describe('CalendarWidget', () => {
  it('renders the month label, weekday headers and a day grid', () => {
    render(<CalendarWidget initialIsoMonth="2026-08" />);
    expect(screen.getByText('August 2026')).toBeInTheDocument();
    for (const label of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
      expect(screen.getByRole('columnheader', { name: label })).toBeInTheDocument();
    }
    const grid = screen.getByRole('grid', { name: /availability calendar/i });
    expect(within(grid).getAllByRole('gridcell').length).toBeGreaterThan(28);
  });

  it('marks booked dates as disabled and refuses selection', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <CalendarWidget initialIsoMonth="2026-08" bookedDates={['2026-08-12']} onSelect={onSelect} />,
    );
    const booked = screen.getByRole('gridcell', { name: '12' });
    expect(booked).toHaveAttribute('aria-disabled', 'true');
    await user.click(booked);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('selecting an open day calls onSelect, writes the URL and emits the event', async () => {
    const onSelect = vi.fn();
    const emit = vi.spyOn(window, 'dispatchEvent');
    const user = userEvent.setup();
    render(<CalendarWidget initialIsoMonth="2026-08" onSelect={onSelect} />);
    await user.click(screen.getByRole('gridcell', { name: '5' }));
    expect(onSelect).toHaveBeenCalledWith('2026-08-05');
    expect(window.location.search).toContain('date=2026-08-05');
    expect(window.location.hash).toBe('#booking');
    const detail = emit.mock.calls
      .map((call) => call[0])
      .find((event) => event.type === 'jon:date-selected') as CustomEvent<string>;
    expect(detail.detail).toBe('2026-08-05');
  });

  it('navigates between months with the Prev/Next buttons', async () => {
    const user = userEvent.setup();
    render(<CalendarWidget initialIsoMonth="2026-08" />);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('September 2026')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Prev' }));
    expect(screen.getByText('August 2026')).toBeInTheDocument();
  });

  it('reflects a deep-linked ?date= as the selected day on mount (even today)', () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const iso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const month = iso.slice(0, 7);
    window.history.replaceState({}, '', `/?date=${iso}`);
    render(<CalendarWidget initialIsoMonth={month} />);
    const selected = screen.getByRole('gridcell', { name: String(now.getDate()) });
    expect(selected).toHaveAttribute('aria-selected', 'true');
  });

  it('supports arrow-key navigation with a roving tabindex', async () => {
    const user = userEvent.setup();
    render(<CalendarWidget initialIsoMonth="2026-08" />);
    const grid = screen.getByRole('grid', { name: /availability calendar/i });
    const cells = within(grid)
      .getAllByRole('gridcell')
      .filter((el) => el.tagName === 'BUTTON');
    cells[0].focus();
    expect(cells[0]).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(cells[1]).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(cells[8]).toHaveFocus();
  });

  it('jumps to the first and last day of the month with Home and End', async () => {
    const user = userEvent.setup();
    render(<CalendarWidget initialIsoMonth="2026-08" />);
    const grid = screen.getByRole('grid', { name: /availability calendar/i });
    const cells = within(grid)
      .getAllByRole('gridcell')
      .filter((el) => el.tagName === 'BUTTON');
    cells[0].focus();
    await user.keyboard('{Home}');
    expect(cells[0]).toHaveFocus();
    expect(cells[0]).toHaveTextContent('1');
    await user.keyboard('{End}');
    expect(cells[30]).toHaveFocus();
    expect(cells[30]).toHaveTextContent('31');
  });

  it('ignores unrecognised keys without moving focus', async () => {
    const user = userEvent.setup();
    render(<CalendarWidget initialIsoMonth="2026-08" />);
    const grid = screen.getByRole('grid', { name: /availability calendar/i });
    const firstDay = within(grid)
      .getAllByRole('gridcell')
      .find((el) => el.tagName === 'BUTTON');
    firstDay!.focus();
    await user.keyboard('a');
    expect(firstDay).toHaveFocus();
  });

  it('selects the focused day with Space', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<CalendarWidget initialIsoMonth="2026-08" onSelect={onSelect} />);
    const grid = screen.getByRole('grid', { name: /availability calendar/i });
    const firstDay = within(grid)
      .getAllByRole('gridcell')
      .find((el) => el.tagName === 'BUTTON');
    firstDay!.focus();
    await user.keyboard(' ');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('selects the focused day with Enter', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<CalendarWidget initialIsoMonth="2026-08" onSelect={onSelect} />);
    const grid = screen.getByRole('grid', { name: /availability calendar/i });
    const firstDay = within(grid)
      .getAllByRole('gridcell')
      .find((el) => el.tagName === 'BUTTON');
    firstDay!.focus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
