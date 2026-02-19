import { Navigate, Outlet } from 'react-router-dom';
import { useGame } from '@/context/GameContext';

export default function RequireAuth() {
  const { state } = useGame();

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
