import { useTranslation } from 'react-i18next';
import { useWS } from '@/context/WebSocketContext';
import { useGame } from '@/context/GameContext';
import { MESSAGE_TYPES, VOTE_OPTIONS } from '@/constants/game';

interface Props {
  chancellorName: string;
  onSent: () => void;
}

export default function VoteAction({ chancellorName, onSent }: Props) {
  const { t } = useTranslation();
  const { send } = useWS();
  const { state } = useGame();

  function vote(choice: string) {
    send(MESSAGE_TYPES.VOTE, {
      playerId: state.playerId,
      roomId: state.roomId,
      vote: choice,
    });
    onSent();
  }

  return (
    <div className="action-content vote-action">
      <h2 className="action-title">{t('actions.voteTitle')}</h2>

      <p style={{ fontSize: '1.3rem', textAlign: 'center', margin: '20px 0' }}>
        {t('actions.voteDesc')}{' '}
        <strong style={{ color: 'var(--gold)' }}>{chancellorName}</strong>
      </p>

      <div className="vote-buttons">
        <button className="vote-btn yes" id="vote-yes" onClick={() => vote(VOTE_OPTIONS.YES)}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✓</div>
          <div>{t('actions.voteYes')}</div>
        </button>
        <button className="vote-btn no" id="vote-no" onClick={() => vote(VOTE_OPTIONS.NO)}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✗</div>
          <div>{t('actions.voteNo')}</div>
        </button>
      </div>
    </div>
  );
}
