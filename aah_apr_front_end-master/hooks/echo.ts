"use client";

import { useEffect, useState } from 'react';
import type Echo from 'laravel-echo';
import { useParentContext } from '@/contexts/ParentContext';

const useEcho = (): Echo<any> | null => {
  const { axiosInstance } = useParentContext();
  const [echoInstance, setEchoInstance] = useState<Echo<any> | null>(null);

  useEffect(() => {
    const connectEcho = async () => {
      if (typeof window === "undefined") return;

      // Do not attempt a WebSocket connection when no Reverb key is configured
      // (e.g. production with BROADCAST_CONNECTION=log). This avoids repeated
      // ERR_CONNECTION_REFUSED / handshake errors in the browser console.
      if (!process.env.NEXT_PUBLIC_REVERB_APP_KEY) return;

      const [{ default: EchoClient }, { default: Pusher }] = await Promise.all([
        import('laravel-echo'),
        import('pusher-js'),
      ]);

      (window as any).Pusher = Pusher;

      const echo = new EchoClient({
        broadcaster: 'reverb',
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? '',
        authorizer: (channel: any) => {
          return {
            authorize: (socketId: string, callback: (error: Error | null, data?: any) => void) => {
              axiosInstance
                .post('/broadcasting/auth', {
                  socket_id: socketId,
                  channel_name: channel.name,
                })
                .then((response: any) => callback(null, response.data))
                .catch((error: any) => callback(error instanceof Error ? error : new Error(String(error))));
            },
          };
        },
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? 'localhost',
        wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
        wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
      });

      setEchoInstance(echo);
    };

    connectEcho();
  }, [axiosInstance]);

  return echoInstance;
};

export default useEcho;
