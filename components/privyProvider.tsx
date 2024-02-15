'use client';
import { PrivyProvider } from '@privy-io/react-auth';
import PlausibleProvider from 'next-plausible';
import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PrivyProviderWrapper({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        appearance: {
          showWalletLoginFirst: true
        },

        loginMethods: [
          'wallet',
          'email',
          'google',
          'twitter',
          'discord',
          'farcaster',
          'github',
          'linkedin',
          'apple'
        ]
      }}
    >
      {children}
    </PrivyProvider>
  );
}
