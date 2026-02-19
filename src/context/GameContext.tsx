import React, { createContext, useContext, useReducer } from 'react';
import type { AppState } from '@/types/game';
import { gameReducer, initialState, type AppAction } from './gameReducer';

interface GameContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame doit être utilisé à l\'intérieur de GameProvider');
  return ctx;
}
