import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface JoinGameFormProps {
  onSubmit: (roomCode: string, password: string | null) => void;
}

export default function JoinGameForm({ onSubmit }: JoinGameFormProps) {
  const { t } = useTranslation();
  const [roomCode, setRoomCode] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit() {
    if (!roomCode.trim()) return;
    onSubmit(roomCode.trim().toUpperCase(), password.trim() || null);
  }

  return (
    <div className="form-card">
      <h2>🚪 <span>{t('lobby.joinGame')}</span></h2>
      <input
        type="text"
        id="room-code"
        value={roomCode}
        onChange={e => setRoomCode(e.target.value.toUpperCase())}
        placeholder={t('lobby.roomCode')}
        maxLength={10}
        onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder={t('lobby.joinPassword')}
        maxLength={20}
      />
      <button id="join-game-btn" className="btn btn-secondary btn-full" onClick={handleSubmit}>
        {t('lobby.joinButton')}
      </button>
    </div>
  );
}
