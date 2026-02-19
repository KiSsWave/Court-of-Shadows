import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LoginFormProps {
  onSubmit: (username: string, password: string) => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(username.trim(), password);
  }

  return (
    <form id="login-form" className="auth-form active" onSubmit={handleSubmit}>
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
          autoComplete="current-password"
          onKeyDown={e => { if (e.key === 'Enter') onSubmit(username.trim(), password); }}
        />
        <button
          type="button"
          className={`btn-toggle-password ${showPassword ? 'active' : ''}`}
          onClick={() => setShowPassword(s => !s)}
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>
      <button type="submit" className="btn btn-primary">
        {t('auth.loginButton')}
      </button>
    </form>
  );
}
