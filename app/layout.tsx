import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import Nav from './nav';
import { Suspense } from 'react';

import PrivyProviderWrapper from '../components/privyProvider';

export const metadata = {
  title: 'SheFi Summit Quests',
  description:
    'A dashboard to track your Quests at SheFi Summit. Quests are completed through the @proofof bot on Farcaster and Lens, or @0xproofof bot on Twitter.'
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
