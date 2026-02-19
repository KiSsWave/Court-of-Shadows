import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from '@/context/GameContext';
import { WebSocketProvider } from '@/context/WebSocketContext';
import AppLayout from '@/components/layout/AppLayout';
import RequireAuth from '@/components/auth/RequireAuth';
import AuthScreen from '@/components/auth/AuthScreen';
import LobbyScreen from '@/components/lobby/LobbyScreen';
import WaitingRoomScreen from '@/components/waiting-room/WaitingRoomScreen';
import GameScreen from '@/components/game/GameScreen';
import GameOverScreen from '@/components/game-over/GameOverScreen';
import RulesScreen from '@/components/rules/RulesScreen';

export default function App() {
  return (
    <GameProvider>
      <WebSocketProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<AuthScreen defaultTab="login" />} />
              <Route path="/register" element={<AuthScreen defaultTab="register" />} />
              <Route path="/rules" element={<RulesScreen />} />

              {/* Protected routes */}
              <Route element={<RequireAuth />}>
                <Route path="/home" element={<LobbyScreen />} />
                <Route path="/room/:code" element={<WaitingRoomScreen />} />
                <Route path="/game/:code" element={<GameScreen />} />
                <Route path="/game-over" element={<GameOverScreen />} />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </WebSocketProvider>
    </GameProvider>
  );
}
