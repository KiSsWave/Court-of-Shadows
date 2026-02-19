import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types/game';

interface Props {
  messages: ChatMessage[];
}

export default function ActivityLog({ messages }: Props) {
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div id="activity-log" ref={logRef} className="activity-log">
      {messages.map((msg, idx) => {
        const date = msg.timestamp ? new Date(msg.timestamp) : new Date();
        const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        return (
          <div key={idx} className={`activity-message ${msg.type ?? 'info'}`}>
            <span>{msg.content}</span>
            <span className="activity-time">{timeStr}</span>
          </div>
        );
      })}
    </div>
  );
}
