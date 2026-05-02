import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

declare global {
  interface Window {
    Capacitor?: { isNativePlatform: () => boolean };
  }
}

export const useAndroidBack = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!window.Capacitor?.isNativePlatform()) return;

    let App: any;
    import('@capacitor/app').then(({ App: CapApp }) => {
      App = CapApp;
      App.addListener('backButton', ({ canGoBack }: { canGoBack: boolean }) => {
        if (location.pathname === '/dashboard') {
          App.minimizeApp();
        } else if (canGoBack) {
          navigate(-1);
        } else {
          App.minimizeApp();
        }
      });
    });

    return () => {
      App?.removeAllListeners?.();
    };
  }, [location.pathname, navigate]);
};
