import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CreateGameFormProps {
  onSubmit: (isPublic: boolean, password: string | null) => void;
}

export default function CreateGameForm({ onSubmit }: CreateGameFormProps) {
  const { t } = useTranslation();
  const [gameType, setGameType] = useState<'public' | 'private'>('public');
  const [password, setPassword] = useState('');

  function handleSubmit() {
    if (gameType === 'private' && !password.trim()) return;
    onSubmit(gameType === 'public', gameType === 'private' ? password.trim() : null);
  }

  return (
    <div className="form-card">
      <h2>🎮 <span>{t('lobby.createGame')}</span></h2>

      <div className="create-game-options">
        <div className="game-type-selector">
          <button
            className={`game-type-btn ${gameType === 'public' ? 'active' : ''}`}
            onClick={() => setGameType('public')}
          >
            🌐 <span>{t('lobby.public')}</span>
          </button>
          <button
            className={`game-type-btn ${gameType === 'private' ? 'active' : ''}`}
            onClick={() => setGameType('private')}
          >
            🔒 <span>{t('lobby.private')}</span>
          </button>
        </div>

        {gameType === 'private' && (
          <div id="private-password-field" className="private-password-field">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t('lobby.gamePassword')}
              maxLength={20}
            />
          </div>
        )}

        <button id="create-game-btn" className="btn btn-primary btn-full" onClick={handleSubmit}>
          {t('lobby.createButton')}
        </button>
      </div>
    </div>
  );
}
