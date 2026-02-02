'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
        success: {
          iconTheme: {
            primary: 'hsl(142, 71%, 45%)',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: 'hsl(0, 84%, 60%)',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
