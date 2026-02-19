import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWS } from '@/context/WebSocketContext';
import { useGame } from '@/context/GameContext';
import { MESSAGE_TYPES } from '@/constants/game';
import { escapeHtml } from '@/utils/escapeHtml';
import ShareCardsPopup from './ShareCardsPopup';
import type { ChatMessage } from '@/types/game';

export default function GameChat() {
  const { t } = useTranslation();
  const { send } = useWS();
  const { state } = useGame();
  const [input, setInput] = useState('');
  const [showSharePopup, setShowSharePopup] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [state.chatMessages]);

  function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const msg = input.trim();
    if (!msg) return;
    send(MESSAGE_TYPES.CHAT_MESSAGE, {
      playerId: state.playerId,
      roomId: state.roomId,
      message: msg,
    });
    setInput('');
  }

  // Determine if the current player has cards to share
  const shareRole = state.shareCardsRole;

  return (
    <div className="game-chat">
      <div className="chat-header-bar">
        <h4>{t('chat.title')}</h4>
        {shareRole && (
          <button
            className="share-cards-open-btn"
            onClick={() => setShowSharePopup(true)}
          >
            📢 {t('shareCards.openBtn', { role: shareRole === 'king' ? t('roles.king') : t('roles.chancellor') })}
          </button>
        )}
      </div>

      <div id="chat-messages" ref={messagesRef} className="chat-messages">
        {state.chatMessages.map((msg: ChatMessage, idx: number) => {
          const timestamp = msg.timestamp ? new Date(msg.timestamp) : new Date();
          const timeStr = timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

          if (msg.isSystem) {
            return (
              <div key={idx} className="chat-message system-message">
                <span>{msg.content}</span>
                <span className="chat-time">{timeStr}</span>
              </div>
            );
          }

          return (
            <div key={idx} className="chat-message">
              <div className="chat-header">
                <span className="chat-author">{msg.playerName}</span>
                <span className="chat-time">{timeStr}</span>
              </div>
              <div
                className="chat-text"
                dangerouslySetInnerHTML={{ __html: escapeHtml(msg.content) }}
              />
            </div>
          );
        })}
      </div>

      <form className="chat-input-bar" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-input"
          placeholder={t('chat.placeholder')}
          value={input}
          onChange={e => setInput(e.target.value)}
          maxLength={300}
        />
        <button type="submit" className="btn-send" disabled={!input.trim()}>
          {t('chat.send')}
        </button>
      </form>

      {showSharePopup && shareRole && (
        <ShareCardsPopup role={shareRole} onClose={() => setShowSharePopup(false)} />
      )}
    </div>
  );
}
