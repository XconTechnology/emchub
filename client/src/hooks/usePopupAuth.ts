import { useState } from 'react';
import { openAuthPopup } from '@/lib/authPopup';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

export function usePopupAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const signIn = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const success = await openAuthPopup('/api/login');
      if (success) {
        // Refresh the auth state
        await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        toast({
          title: "Welcome!",
          description: "You have been signed in successfully.",
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async () => {
    // For Replit Auth, sign up uses the same endpoint as sign in
    await signIn();
  };

  return {
    signIn,
    signUp,
    isLoading,
  };
}