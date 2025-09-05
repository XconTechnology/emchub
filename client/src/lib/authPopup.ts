// Authentication popup utility functions
export const openAuthPopup = (url: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const popup = window.open(
      url,
      'auth',
      'width=500,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
    );

    if (!popup) {
      reject(new Error('Failed to open popup window'));
      return;
    }

    // Check if popup is closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        resolve(false); // Authentication was cancelled
      }
    }, 1000);

    // Listen for messages from popup
    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'AUTH_SUCCESS') {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        popup.close();
        resolve(true);
      } else if (event.data.type === 'AUTH_ERROR') {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        popup.close();
        reject(new Error(event.data.error || 'Authentication failed'));
      }
    };

    window.addEventListener('message', messageListener);

    // Cleanup after 5 minutes
    setTimeout(() => {
      clearInterval(checkClosed);
      window.removeEventListener('message', messageListener);
      if (!popup.closed) {
        popup.close();
      }
      reject(new Error('Authentication timeout'));
    }, 5 * 60 * 1000);
  });
};

export const handleAuthSuccess = () => {
  // This function is called from the popup window to notify parent of success
  if (window.opener) {
    window.opener.postMessage({ type: 'AUTH_SUCCESS' }, window.location.origin);
    window.close();
  }
};

export const handleAuthError = (error: string) => {
  // This function is called from the popup window to notify parent of error
  if (window.opener) {
    window.opener.postMessage({ type: 'AUTH_ERROR', error }, window.location.origin);
    window.close();
  }
};