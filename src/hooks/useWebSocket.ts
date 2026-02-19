import { useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import type { ServerMessage } from '@/types/websocket';

const MAX_RECONNECT_ATTEMPTS = 20;

export function useWebSocket() {
  const { dispatch, state } = useGame();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isReconnectingRef = useRef(false);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPingTimeRef = useRef<number | null>(null);

  const scheduleReconnect = useCallback(() => {
    if (isReconnectingRef.current) return;
    reconnectAttemptsRef.current += 1;

    if (reconnectAttemptsRef.current > MAX_RECONNECT_ATTEMPTS) {
      dispatch({ type: 'WS_RECONNECT_FAILED' });
      return;
    }

    isReconnectingRef.current = true;
    const delay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current - 1), 10000);
    dispatch({ type: 'WS_RECONNECTING', attempt: reconnectAttemptsRef.current });

    setTimeout(() => {
      isReconnectingRef.current = false;
      connect(); // eslint-disable-line @typescript-eslint/no-use-before-define
    }, delay);
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const connect = useCallback(() => {
    if (isReconnectingRef.current) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0;
      isReconnectingRef.current = false;
      dispatch({ type: 'WS_CONNECTED' });

      // Ping toutes les 10s pour mesurer la latence et maintenir la connexion
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          lastPingTimeRef.current = Date.now();
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 10000);

      // Ré-authentification automatique (token prioritaire)
      const stored = localStorage.getItem('courtOfShadows_user');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          if (user.token) {
            ws.send(JSON.stringify({ type: 'login_with_token', token: user.token }));
          } else {
            const password = sessionStorage.getItem('tempPassword');
            if (password && user.username) {
              ws.send(JSON.stringify({ type: 'login', username: user.username, password }));
            }
          }
        } catch {
          // JSON invalide, ignorer
        }
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const message: ServerMessage = JSON.parse(event.data as string);
        if (message.type === 'pong') {
          if (lastPingTimeRef.current) {
            const latency = Date.now() - lastPingTimeRef.current;
            dispatch({ type: 'RECORD_LATENCY', latency });
          }
          return;
        }
        dispatch({ type: 'WS_MESSAGE', message });
      } catch {
        // Ignorer les messages invalides
      }
    };

    ws.onerror = () => {
      // La fermeture gère la reconnexion
    };

    ws.onclose = () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      dispatch({ type: 'WS_DISCONNECTED' });
      scheduleReconnect();
    };
  }, [dispatch, scheduleReconnect]);

  const send = useCallback((type: string, data: Record<string, unknown> = {}) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, ...data }));
    }
  }, []);

  useEffect(() => {
    connect();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          reconnectAttemptsRef.current = 0;
          isReconnectingRef.current = false;
          connect();
        } else {
          try {
            ws.send(JSON.stringify({ type: 'ping' }));
          } catch {
            connect();
          }
        }
      }
    };

    const handleOnline = () => {
      reconnectAttemptsRef.current = 0;
      isReconnectingRef.current = false;
      connect();
    };

    const handleOffline = () => {
      dispatch({ type: 'WS_DISCONNECTED' });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      wsRef.current?.close();
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { send };
}
