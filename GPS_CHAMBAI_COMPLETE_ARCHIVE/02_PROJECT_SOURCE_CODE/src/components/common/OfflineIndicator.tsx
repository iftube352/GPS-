import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-600 text-white px-3 py-1.5 text-[11px] font-black flex items-center justify-center gap-1.5 shadow-sm z-40 shrink-0">
      <WifiOff size={13} />
      <span>Offline Mode Active — All GPS Chambai records are saved locally on your device</span>
    </div>
  );
};
