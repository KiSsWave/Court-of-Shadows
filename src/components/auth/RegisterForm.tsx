import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface RegisterFormProps {
  onSubmit: (username: string, password: string, confirm: string) => void;
}

export default function RegisterForm({ onSubmit }: RegisterFormProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(username.trim(), password, confirm);
  }

  return (
    <form id="register-form" className="auth-form active" onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder={t('auth.username')}
        maxLength={20}
        autoComplete="username"
      />
      <div className="password-input-wrapper">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={t('auth.password')}
          maxLength={50}
          autoComplete="new-password"
        />
        <button
          type="button"
          className={`btn-toggle-password ${showPassword ? 'active' : ''}`}
          onClick={() => setShowPassword(s => !s)}
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>
      <div className="password-input-wrapper">
        <input
          type={showConfirm ? 'text' : 'password'}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder={t('auth.confirmPassword')}
          maxLength={50}
          autoComplete="new-password"
          onKeyDown={e => { if (e.key === 'Enter') onSubmit(username.trim(), password, confirm); }}
        />
        <button
          type="button"
          className={`btn-toggle-password ${showConfirm ? 'active' : ''}`}
          onClick={() => setShowConfirm(s => !s)}
        >
          {showConfirm ? '🙈' : '👁️'}
        </button>
      </div>
      <button type="submit" className="btn btn-primary">
        {t('auth.registerButton')}
      </button>
    </form>
  );
}
