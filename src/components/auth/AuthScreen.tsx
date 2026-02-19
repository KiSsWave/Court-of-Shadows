import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGame } from '@/context/GameContext';
import { useWS } from '@/context/WebSocketContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthScreenProps {
  defaultTab?: 'login' | 'register';
}

export default function AuthScreen({ defaultTab = 'login' }: AuthScreenProps) {
  const { t } = useTranslation();
  const { state, dispatch } = useGame();
  const { send } = useWS();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [error, setError] = useState('');

  // Redirect si déjà authentifié
  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [state.isAuthenticated, navigate]);

  // Surveiller les réponses login/register
  useEffect(() => {
    // Les messages sont traités dans le reducer ;
    // on surveille les changements d'état pour détecter les erreurs
    // via le dernier message (non stocké, donc on passe par un mécanisme léger)
    // Les erreurs arrivent dans les messages WS mais ne sont pas dans AppState —
    // on écoute les notifications générales pour les afficher ici.
  }, []);

  // Sync onglet avec l'URL
  useEffect(() => {
    if (location.pathname === '/register') setActiveTab('register');
    else setActiveTab('login');
  }, [location.pathname]);

  function handleTabClick(tab: 'login' | 'register') {
    setActiveTab(tab);
    setError('');
    navigate(`/${tab}`, { replace: true });
  }

  function handleLogin(username: string, password: string) {
    setError('');
    if (!username || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }
    sessionStorage.setItem('tempPassword', password);
    send('login', { username, password });
  }

  function handleRegister(username: string, password: string, confirm: string) {
    setError('');
    if (!username || !password || !confirm) {
      setError(t('auth.fillAllFields'));
      return;
    }
    if (password !== confirm) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    send('register', { username, password });
  }

  return (
    <div id="auth-screen" className="screen active">
      <div className="auth-layout">
        <div className="auth-content">
          <h1 className="title">{t('lobby.title')}</h1>
          <p className="subtitle">{t('lobby.subtitle')}</p>

          <div className="form-card">
            <div className="auth-tabs">
              <button
                className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => handleTabClick('login')}
              >
                {t('auth.login')}
              </button>
              <button
                className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => handleTabClick('register')}
              >
                {t('auth.register')}
              </button>
            </div>

            {activeTab === 'login' ? (
              <LoginForm onSubmit={handleLogin} />
            ) : (
              <RegisterForm onSubmit={handleRegister} />
            )}

            {error && <div className="auth-error visible">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
