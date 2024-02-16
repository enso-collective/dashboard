'use client';
import { PrivyProvider } from '@privy-io/react-auth';

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
        // @ts-ignore
        _render: {
          inDialog: false,
          inParentNodeId: 'render-privy'
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
