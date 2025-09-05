import { useEffect } from 'react';
import { handleAuthSuccess } from '@/lib/authPopup';

// This component handles the authentication success callback for popups
export default function AuthSuccess() {
  useEffect(() => {
    // Notify parent window of successful authentication
    handleAuthSuccess();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Authentication successful! Closing window...</p>
      </div>
    </div>
  );
}