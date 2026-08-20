/**
 * F08 — Booking form (React island, LG3). Hydrates the SSR form for inline
 * validation, pending/success/error states and endpoint delivery. Without JS
 * the SSR `<form action method=POST>` still submits to the configured endpoint
 * (mailto: by default) — progressive enhancement, never a dead form.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { validateBooking, type BookingFieldErrors, type BookingValues } from '../../lib/validation';
import { submitBooking } from '../../lib/booking';

export interface BookingPackage {
  id: string;
  eyebrow: string;
}

export interface BookingFormProps {
  /** Recipient for the mailto: fallback handoff. */
  mailto: string;
  /** Configurable static-host form endpoint (empty → mailto handoff). */
  endpoint?: string;
  /** Package tiers so `?package=<id>` can resolve to a display label. */
  packages?: BookingPackage[];
}

type Status = 'idle' | 'pending' | 'ok' | 'error';

const EMPTY: BookingValues = { name: '', email: '', date: '', package: '', message: '' };

function hashParam(name: string): string | null {
  const hash = window.location.hash;
  const idx = hash.indexOf('?');
  return idx === -1 ? null : new URLSearchParams(hash.slice(idx + 1)).get(name);
}

function readPrefillParams(): { pkgId: string | null; date: string | null } {
  const url = new URL(window.location.href);
  return {
    pkgId: url.searchParams.get('package') ?? hashParam('package'),
    date: url.searchParams.get('date') ?? hashParam('date'),
  };
}

type FormSubmitEvent = Parameters<NonNullable<React.ComponentProps<'form'>['onSubmit']>>[0];

export default function BookingForm({ mailto, endpoint, packages = [] }: BookingFormProps) {
  const [values, setValues] = useState<BookingValues>(EMPTY);
  const [errors, setErrors] = useState<BookingFieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [gotcha, setGotcha] = useState('');

  const labelFor = useMemo(() => new Map(packages.map((p) => [p.id, p.eyebrow])), [packages]);

  // Initial prefill from the URL (deep links from F04 package cards).
  useEffect(() => {
    const { pkgId, date } = readPrefillParams();
    if (pkgId && labelFor.has(pkgId)) setValues((v) => ({ ...v, package: labelFor.get(pkgId)! }));
    if (date) setValues((v) => ({ ...v, date }));
  }, [labelFor]);

  // Live updates: calendar selection (custom event) and hash/URL changes.
  useEffect(() => {
    const onDateSelected = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (detail) setValues((v) => ({ ...v, date: detail }));
    };
    const onUrlChange = () => {
      const { pkgId, date } = readPrefillParams();
      setValues((v) => ({
        ...v,
        date: date ?? v.date,
        package: pkgId && labelFor.has(pkgId) ? labelFor.get(pkgId)! : v.package,
      }));
    };
    window.addEventListener('jon:date-selected', onDateSelected);
    window.addEventListener('hashchange', onUrlChange);
    window.addEventListener('popstate', onUrlChange);
    return () => {
      window.removeEventListener('jon:date-selected', onDateSelected);
      window.removeEventListener('hashchange', onUrlChange);
      window.removeEventListener('popstate', onUrlChange);
    };
  }, [labelFor]);

  const setField = useCallback((name: keyof BookingValues, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((current) => {
      const key = name as keyof BookingFieldErrors;
      return current[key] ? { ...current, [key]: undefined } : current;
    });
  }, []);

  const handleSubmit = useCallback(
    async (event: FormSubmitEvent) => {
      event.preventDefault();
      if (status === 'pending') return;
      if (gotcha) {
        // Honeypot tripped — pretend success without delivering.
        setStatus('ok');
        return;
      }
      const nextErrors = validateBooking(values);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        setStatus('error');
        setErrorMessage('A couple of fields need attention below.');
        return;
      }
      setStatus('pending');
      setErrorMessage('');
      try {
        const result = await submitBooking(values, { endpoint, mailto });
        if (result.status === 'handoff') {
          window.location.assign(result.url);
          setStatus('ok');
          return;
        }
        setStatus('ok');
      } catch {
        setStatus('error');
        setErrorMessage("That didn't go through — mind trying again?");
      }
    },
    [status, gotcha, values, endpoint, mailto],
  );

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setStatus('idle');
    setErrorMessage('');
  };

  const action = endpoint || `mailto:${mailto}`;

  return (
    <div className="booking-form">
      {status === 'ok' ? (
        <div role="status" className="gatefold mt-10 grid gap-4 text-center" aria-live="polite">
          <p className="eyebrow" id="booking-ok-eyebrow">
            Received
          </p>
          <h3 className="text-display text-ivory">The date is pencilled in.</h3>
          <p className="mx-auto max-w-md text-ivory-dim">
            Thank you — I'll confirm availability within 24 hours. If you'd like to chat sooner,
            write to{' '}
            <a className="text-gold underline underline-offset-4" href={`mailto:${mailto}`}>
              {mailto}
            </a>
            .
          </p>
          <div>
            <button type="button" className="btn mt-4" onClick={reset}>
              Make another enquiry
            </button>
          </div>
        </div>
      ) : (
        <form
          action={action}
          method="POST"
          className="mt-10 grid gap-5"
          data-testid="booking-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Honeypot trap (hidden from humans). */}
          <div className="hidden" aria-hidden="true">
            <label>
              Leave this empty:{' '}
              <input
                name="_gotcha"
                tabIndex={-1}
                autoComplete="off"
                value={gotcha}
                onChange={(e) => setGotcha(e.target.value)}
              />
            </label>
          </div>
          <input
            type="hidden"
            name="subject"
            value={`Booking inquiry — ${values.package || 'Your date'}`}
          />
          {values.package && <input type="hidden" name="package" value={values.package} />}

          <div className="grid gap-1">
            <label
              className="font-mono text-mono uppercase tracking-[0.12em] text-gold"
              htmlFor="name"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={values.name}
              onChange={(e) => setField('name', e.target.value)}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className="w-full rounded-md border hairline-gold bg-noir-lift px-4 py-2 text-ivory outline-none ring-gold focus-within:ring-2"
            />
            {errors.name && (
              <p id="name-error" className="font-mono text-mono text-gold-bright">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <label
              className="font-mono text-mono uppercase tracking-[0.12em] text-gold"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={values.email}
              onChange={(e) => setField('email', e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className="w-full rounded-md border hairline-gold bg-noir-lift px-4 py-2 text-ivory outline-none ring-gold focus-within:ring-2"
            />
            {errors.email && (
              <p id="email-error" className="font-mono text-mono text-gold-bright">
                {errors.email}
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <label
              className="font-mono text-mono uppercase tracking-[0.12em] text-gold"
              htmlFor="date"
            >
              Event date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              value={values.date}
              onChange={(e) => setField('date', e.target.value)}
              aria-invalid={errors.date ? true : undefined}
              aria-describedby={errors.date ? 'date-error' : undefined}
              className="w-full rounded-md border hairline-gold bg-noir-lift px-4 py-2 text-ivory outline-none ring-gold focus-within:ring-2"
            />
            {errors.date && (
              <p id="date-error" className="font-mono text-mono text-gold-bright">
                {errors.date}
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <label
              className="font-mono text-mono uppercase tracking-[0.12em] text-gold"
              htmlFor="package"
            >
              Package
            </label>
            <input
              id="package"
              name="package"
              type="text"
              readOnly
              value={values.package}
              className="w-full rounded-md border hairline-gold bg-noir-lift px-4 py-2 text-ivory-dim outline-none"
            />
          </div>

          <div className="grid gap-1">
            <label
              className="font-mono text-mono uppercase tracking-[0.12em] text-gold"
              htmlFor="message"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="What's the occasion? Venue size? A song you'd love to hear?"
              value={values.message}
              onChange={(e) => setField('message', e.target.value)}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? 'message-error' : undefined}
              className="w-full rounded-md border hairline-gold bg-noir-lift px-4 py-2 text-ivory outline-none ring-gold focus-within:ring-2"
            ></textarea>
            {errors.message && (
              <p id="message-error" className="font-mono text-mono text-gold-bright">
                {errors.message}
              </p>
            )}
          </div>

          {status === 'error' && (
            <p role="alert" className="font-mono text-mono text-gold-bright" aria-live="assertive">
              {errorMessage}
            </p>
          )}

          <div className="grid gap-3 pt-2">
            <button
              type="submit"
              className="btn w-full justify-center"
              disabled={status === 'pending'}
            >
              {status === 'pending' ? 'Sending…' : 'Send the booking'}
            </button>
            <p className="text-center font-mono text-mono text-ivory-dim">
              Prefer to write?{' '}
              <a className="text-gold underline underline-offset-4" href={`mailto:${mailto}`}>
                Email {mailto}
              </a>
            </p>
          </div>

          <p className="font-mono text-mono text-ivory-dim/70">
            Your details are used only to reply to this enquiry — no lists, no spam, ever.
          </p>
        </form>
      )}
    </div>
  );
}
