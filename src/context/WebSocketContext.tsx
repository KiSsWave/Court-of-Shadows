import React, { createContext, useContext } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface WebSocketContextValue {
  send: (type: string, data?: Record<string, unknown>) => void;
}

const WebSocketContext = createContext<WebSocketContextValue>({ send: () => {} });

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { send } = useWebSocket();
  return (
    <WebSocketContext.Provider value={{ send }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWS(): WebSocketContextValue {
  return useContext(WebSocketContext);
}
