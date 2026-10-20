'use client';

import { useId, useState } from 'react';
import { ArrowRight, UserRound } from 'lucide-react';

export default function StudentSignInForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => Promise<void>;
  onCancel?: () => void;
}) {
  const id = useId();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const creating = mode === 'register';

  async function submitStudentForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setError('');
    if (creating && data.password !== data.confirmPassword) {
      setError('The passwords do not match. Please check them.');
      return;
    }
    setPending(true);
    try {
      const response = await fetch('/api/auth/' + mode, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Unable to log in. Please try again.');
      await onSuccess();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to connect. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="student-login-form">
      <div className="auth-heading">
        <span className="category-icon">
          <UserRound size={26} />
        </span>
        <h2>{creating ? 'Create your account' : 'Log in'}</h2>
        <p>
          {creating
            ? 'A few details and you’re ready to go.'
            : 'Welcome back. Pick up where you left off.'}
        </p>
      </div>
      <form onSubmit={submitStudentForm} key={mode} aria-label={creating ? 'Create account' : 'Log in'}>
        <fieldset disabled={pending}>
          {creating && (
            <>
              <label htmlFor={id + '-name'}>Your name</label>
              <input
                id={id + '-name'}
                name="displayName"
                autoComplete="name"
                placeholder="Your name"
                minLength={2}
                maxLength={50}
                required
              />
            </>
          )}
          <label htmlFor={id + '-email'}>Email address</label>
          <input
            id={id + '-email'}
            name="email"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            maxLength={254}
            required
          />
          <label htmlFor={id + '-password'}>Password</label>
          <input
            id={id + '-password'}
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={creating ? 'new-password' : 'current-password'}
            minLength={8}
            maxLength={128}
            aria-describedby={creating ? id + '-password-hint' : undefined}
            required
          />
          {creating && (
            <>
              <p className="auth-hint" id={id + '-password-hint'}>
                Use at least 8 characters.
              </p>
              <label htmlFor={id + '-confirm'}>Confirm password</label>
              <input
                id={id + '-confirm'}
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
              />
            </>
          )}
          <label className="auth-show-password">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(event) => setShowPassword(event.target.checked)}
            />{' '}
            Show password
          </label>
          {creating && (
            <>
              <label htmlFor={id + '-student'}>I am a...</label>
              <select id={id + '-student'} name="studentType" defaultValue="incoming">
                <option value="incoming">New / incoming student</option>
                <option value="current">Current UNT student</option>
              </select>
            </>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button primary full auth-submit" type="submit" disabled={pending}>
            {pending
              ? creating
                ? 'Creating account…'
                : 'Logging in…'
              : creating
                ? 'Create account'
                : 'Log in'}
            {!pending && <ArrowRight size={17} />}
          </button>
        </fieldset>
      </form>
      <p className="auth-switch">
        {creating ? 'Already have an account?' : 'New here?'}{' '}
        <button
          className="link-button"
          type="button"
          disabled={pending}
          onClick={() => {
            setMode(creating ? 'login' : 'register');
            setError('');
            setShowPassword(false);
          }}
        >
          {creating ? 'Log in' : 'Create an account'}
        </button>
      </p>
      {onCancel ? (
        <button className="link-button auth-guest" onClick={onCancel} disabled={pending}>
          Keep browsing as a guest
        </button>
      ) : (
        <a className="text-link auth-guest" href="#explore">
          Keep browsing as a guest
        </a>
      )}
    </div>
  );
}
