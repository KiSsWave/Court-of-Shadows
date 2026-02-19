import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '@/components/ui/LanguageSelector';
import ConnectionBanner from '@/components/ui/ConnectionBanner';
import NotificationStack from '@/components/ui/Notification';
import { useGame } from '@/context/GameContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <ConnectionBanner />
      <LanguageSelector />
      {children}
      <NotificationStack />
    </>
  );
}
