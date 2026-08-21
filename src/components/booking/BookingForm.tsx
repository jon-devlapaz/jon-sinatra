/**
 * F08 — Booking form (React island, LG3). Hydrates the SSR form for inline
 * validation, pending/success/error states and endpoint delivery. Without JS
 * the SSR `<form action method=POST>` still submits to the configured endpoint
 * (mailto: by default) — progressive enhancement, never a dead form.
 *
 * Aurelian Gallery styling: underline-only inputs, label-sm uppercase,
 * sharp corners, brushed gold accents.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { validateBooking, type BookingFieldErrors, type BookingValues } from '../../lib/validation';
import { submitBooking, type GoogleFormConfig } from '../../lib/booking';

export interface BookingPackage {
  id: string;
  eyebrow: string;
}

export interface BookingFormProps {
  /** Recipient for the mailto: fallback handoff. */
  mailto: string;
  /** Configurable static-host form endpoint (empty → mailto handoff). */
  endpoint?: string;
  googleForm?: GoogleFormConfig;
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

const labelClass =
  'block font-label text-label-sm font-semibold uppercase text-on-surface-variant mb-2';
const inputClass =
  'w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary outline-none py-2 font-body text-body-md text-on-surface transition-colors duration-200 placeholder:text-on-surface-variant placeholder:opacity-50';
const errorClass = 'font-label text-label-sm font-semibold text-error mt-1';

export default function BookingForm({ mailto, endpoint, googleForm, packages = [] }: BookingFormProps) {
  const [values, setValues] = useState<BookingValues>(EMPTY);
  const [errors, setErrors] = useState<BookingFieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [gotcha, setGotcha] = useState('');

  const labelFor = useMemo(() => new Map(packages.map((p) => [p.id, p.eyebrow])), [packages]);

  useEffect(() => {
    const { pkgId, date } = readPrefillParams();
    if (pkgId && labelFor.has(pkgId)) setValues((v) => ({ ...v, package: labelFor.get(pkgId)! }));
    if (date) setValues((v) => ({ ...v, date }));
  }, [labelFor]);

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
        const result = await submitBooking(values, { endpoint, googleForm, mailto });
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
    [status, gotcha, values, endpoint, googleForm, mailto],
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
        <div
          role="status"
          className="card-white mt-10 grid gap-4 p-8 text-center"
          aria-live="polite"
        >
          <p className="font-label text-subheading-caps text-primary" id="booking-ok-eyebrow">
            Received
          </p>
          <h3 className="font-display text-headline-md font-medium text-on-surface">
            Thanks, I received your note.
          </h3>
          <p className="mx-auto max-w-md font-body text-body-md text-on-surface-variant font-light leading-loose">
            Thank you — I’ll check the details and get back to you as soon as I can. If you’d like to chat sooner, write to{' '}
            <a className="text-primary underline underline-offset-4" href={`mailto:${mailto}`}>
              {mailto}
            </a>
            .
          </p>
          <div>
            <button type="button" className="btn-ghost mt-4" onClick={reset}>
              Send another note
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
            <label className={labelClass} htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={values.name}
              onChange={(e) => setField('name', e.target.value)}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={inputClass}
            />
            {errors.name && <p id="name-error" className={errorClass}>{errors.name}</p>}
          </div>

          <div className="grid gap-1">
            <label className={labelClass} htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={values.email}
              onChange={(e) => setField('email', e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={inputClass}
            />
            {errors.email && <p id="email-error" className={errorClass}>{errors.email}</p>}
          </div>

          <div className="grid gap-1">
            <label className={labelClass} htmlFor="date">Event date</label>
            <input
              id="date"
              name="date"
              type="date"
              required
              value={values.date}
              onChange={(e) => setField('date', e.target.value)}
              aria-invalid={errors.date ? true : undefined}
              aria-describedby={errors.date ? 'date-error' : undefined}
              className={inputClass}
            />
            {errors.date && <p id="date-error" className={errorClass}>{errors.date}</p>}
          </div>

          <div className="grid gap-1">
            <label className={labelClass} htmlFor="package">Package</label>
            <input
              id="package"
              name="package"
              type="text"
              readOnly
              value={values.package}
              className={inputClass + ' text-on-surface-variant'}
            />
          </div>

          <div className="grid gap-1">
            <label className={labelClass} htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="What's the occasion? Venue size? A song you'd love to hear?"
              value={values.message}
              onChange={(e) => setField('message', e.target.value)}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? 'message-error' : undefined}
              className={inputClass}
            ></textarea>
            {errors.message && <p id="message-error" className={errorClass}>{errors.message}</p>}
          </div>

          {status === 'error' && (
            <p role="alert" className={errorClass} aria-live="assertive">
              {errorMessage}
            </p>
          )}

          <div className="grid gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary w-full justify-center"
              disabled={status === 'pending'}
              aria-busy={status === 'pending'}
            >
              {status === 'pending' ? 'Sending…' : 'Send my note'}
            </button>
            <p className="text-center font-label text-sm text-on-surface-variant">
              Prefer email?{' '}
              <a className="text-primary underline underline-offset-4" href={`mailto:${mailto}`}>
                Email {mailto}
              </a>
            </p>
          </div>

          <p className="font-label text-sm text-on-surface-variant">
            I’ll use your details only to reply about your event.
          </p>
        </form>
      )}
    </div>
  );
}