import { useState, useEffect } from 'react';
import { pushAPI } from '../services/api';

const VAPID_PUBLIC_KEY =
  process.env.REACT_APP_VAPID_PUBLIC_KEY ||
  'BDiOxEUWJnvf9N7XWXabzaCnUWkoHfVEvXqMRRr_NPhdIYH6M3euv1gEvIIfh4CzZR5HYN7zdbGO1kFJYGeIDAY';

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export const usePushNotifications = () => {
  const isSupported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  const [permission,   setPermission]   = useState<NotificationPermission>(
    isSupported ? Notification.permission : 'denied'
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  useEffect(() => {
    if (!isSupported) return;
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((s) => setIsSubscribed(!!s))
    );
  }, [isSupported]);

  const subscribe = async (): Promise<boolean> => {
    setError('');
    if (!isSupported) { setError('Push notifications are not supported in this browser.'); return false; }
    if (!VAPID_PUBLIC_KEY) { setError('Push not configured — add REACT_APP_VAPID_PUBLIC_KEY to Vercel and redeploy.'); return false; }
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return false;

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as ArrayBuffer,
      });
      await pushAPI.subscribe(sub.toJSON());
      setIsSubscribed(true);
      return true;
    } catch (e: any) {
      setError(e?.message || 'Failed to subscribe to notifications.');
      console.error('[push] subscribe error:', e);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async (): Promise<void> => {
    if (!isSupported) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await pushAPI.unsubscribe(sub.endpoint);
        await sub.unsubscribe();
        setIsSubscribed(false);
      }
    } catch (e) {
      console.error('[push] unsubscribe error:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => (isSubscribed ? unsubscribe() : subscribe());

  return { isSupported, permission, isSubscribed, loading, error, subscribe, unsubscribe, toggle };
};
