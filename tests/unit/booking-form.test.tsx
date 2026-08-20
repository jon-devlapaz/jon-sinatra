/**
 * @vitest-environment jsdom
 *
 * F08 — booking island: URL prefill, live date/package updates, validation,
 * honeypot, mailto handoff and endpoint delivery with success/error states.
 */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BookingForm, { type BookingPackage } from '../../src/components/booking/BookingForm';

const packages: BookingPackage[] = [
  { id: 'cocktail', eyebrow: 'Cocktail Hour' },
  { id: 'standard', eyebrow: 'The Standard' },
];

const props = {
  mailto: 'bookings@example.com',
  packages,
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

beforeEach(() => {
  window.history.replaceState({}, '', '/');
});

function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  return async () => {
    await user.type(screen.getByLabelText('Name'), 'Avery Booker');
    await user.type(screen.getByLabelText('Email'), 'avery@example.com');
    await user.type(screen.getByLabelText('Event date'), '2026-12-20');
    await user.type(screen.getByLabelText('Message'), 'A gala of 120 in the main ballroom.');
  };
}

describe('BookingForm', () => {
  it('prefills package and date from the URL params', () => {
    window.history.replaceState({}, '', '/?package=standard&date=2026-12-20');
    render(<BookingForm {...props} />);
    expect(screen.getByLabelText('Package')).toHaveValue('The Standard');
    expect(screen.getByLabelText('Event date')).toHaveValue('2026-12-20');
  });

  it('updates the date live from the calendar selection event', async () => {
    render(<BookingForm {...props} />);
    act(() => {
      window.dispatchEvent(new CustomEvent('jon:date-selected', { detail: '2026-09-05' }));
    });
    expect(screen.getByLabelText('Event date')).toHaveValue('2026-09-05');
  });

  it('updates the package live when the URL changes (hashchange)', async () => {
    render(<BookingForm {...props} />);
    act(() => {
      window.history.replaceState({}, '', '/?package=cocktail#booking');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(screen.getByLabelText('Package')).toHaveValue('Cocktail Hour');
  });

  it('reset after a success restores a blank, editable form', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    render(<BookingForm {...props} endpoint="https://form.example/send" />);
    await fillValidForm(user)();
    await user.click(screen.getByRole('button', { name: /send the booking/i }));
    expect(await screen.findByText(/date is pencilled in/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /make another enquiry/i }));
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Event date')).toHaveValue('');
    expect(screen.getByRole('button', { name: /send the booking/i })).toBeEnabled();
  });

  it('leaves the package alone when the URL carries no package', async () => {
    render(<BookingForm {...props} />);
    act(() => {
      window.history.replaceState({}, '', '/#booking');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(screen.getByLabelText('Package')).toHaveValue('');
  });

  it('shows an inline message error when the note is too long', async () => {
    const user = userEvent.setup();
    render(<BookingForm {...props} />);
    await user.type(screen.getByLabelText('Name'), 'Avery Booker');
    await user.type(screen.getByLabelText('Email'), 'avery@example.com');
    await user.type(screen.getByLabelText('Event date'), '2026-12-20');
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'x'.repeat(1001) },
    });
    await user.click(screen.getByRole('button', { name: /send the booking/i }));
    const message = screen.getByLabelText('Message');
    expect(message).toHaveAttribute('aria-invalid', 'true');
    expect(message.getAttribute('aria-describedby')).toBe('message-error');
    expect(screen.getByText(/keep the note under 1000 characters/i)).toBeInTheDocument();
  });

  it('shows inline errors and blocks submit for an invalid form', async () => {
    const user = userEvent.setup();
    render(<BookingForm {...props} />);
    await user.click(screen.getByRole('button', { name: /send the booking/i }));
    expect(screen.getByText(/please add your name/i)).toBeInTheDocument();
    expect(screen.getByText(/add an email/i)).toBeInTheDocument();
    const name = screen.getByLabelText('Name');
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name.getAttribute('aria-describedby')).toBe('name-error');
  });

  it('clears a field error as soon as the visitor edits the field', async () => {
    const user = userEvent.setup();
    render(<BookingForm {...props} />);
    await user.click(screen.getByRole('button', { name: /send the booking/i }));
    expect(screen.getByText(/please add your name/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText('Name'), 'A');
    expect(screen.queryByText(/please add your name/i)).not.toBeInTheDocument();
  });

  it('trips the honeypot and shows success without sending', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<BookingForm {...props} endpoint="https://form.example/send" />);
    const honeypot = screen.getByLabelText(/leave this empty/i);
    await user.type(honeypot, 'spambot');
    await fillValidForm(user)();
    await user.click(screen.getByRole('button', { name: /send the booking/i }));
    expect(await screen.findByText(/date is pencilled in/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('POSTs to the endpoint and shows the success panel', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);
    render(<BookingForm {...props} endpoint="https://form.example/send" />);
    await fillValidForm(user)();
    await user.click(screen.getByRole('button', { name: /send the booking/i }));
    expect(await screen.findByText(/date is pencilled in/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://form.example/send');
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
  });

  it('shows an inline error and lets the visitor retry on a failed endpoint', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);
    render(<BookingForm {...props} endpoint="https://form.example/send" />);
    await fillValidForm(user)();
    const submit = screen.getByRole('button', { name: /send the booking/i });
    await user.click(submit);
    expect(await screen.findByText(/didn't go through/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /send the booking/i }));
    expect(await screen.findByText(/date is pencilled in/i)).toBeInTheDocument();
  });

  it('hands off to a mailto link when no endpoint is configured', async () => {
    const user = userEvent.setup();
    const assign = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, assign },
    });
    vi.stubGlobal('fetch', vi.fn());
    render(<BookingForm {...props} />);
    await fillValidForm(user)();
    await user.click(screen.getByRole('button', { name: /send the booking/i }));
    expect(await screen.findByText(/date is pencilled in/i)).toBeInTheDocument();
    expect(assign).toHaveBeenCalledTimes(1);
    expect(String(assign.mock.calls[0][0])).toMatch(/^mailto:bookings@example\.com/);
  });

  it('disables the submit button while a request is pending', async () => {
    const user = userEvent.setup();
    let resolveFetch: (value: { ok: boolean; status: number }) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
      ),
    );
    render(<BookingForm {...props} endpoint="https://form.example/send" />);
    await fillValidForm(user)();
    await user.click(screen.getByRole('button', { name: /send the booking/i }));
    const submit = screen.getByRole('button', { name: /sending/i });
    expect(submit).toBeDisabled();
    resolveFetch!({ ok: true, status: 200 });
    expect(await screen.findByText(/date is pencilled in/i)).toBeInTheDocument();
  });

  it('renders the mailto dual-channel link beside the form', () => {
    render(<BookingForm {...props} />);
    const link = screen.getByRole('link', { name: /email bookings@example\.com/i });
    expect(link).toHaveAttribute('href', 'mailto:bookings@example.com');
  });
});
