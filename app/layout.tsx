import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import Nav from './nav';
import { Suspense } from 'react';

import PrivyProviderWrapper from '../components/privyProvider';

export const metadata = {
  title: 'The proof:of AI Attestor',
  description:
    'A dashboard to track your attestation Proofs and to interact wit AI Attestors on Warpcast, Lens, and Twitter'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full" suppressHydrationWarning={true}>
        <PrivyProviderWrapper>
          <Suspense>
            <Nav />
          </Suspense>
          {children}
        </PrivyProviderWrapper>
        <Analytics />
      </body>
    </html>
  );
}
