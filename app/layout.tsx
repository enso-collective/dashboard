import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import Nav from './nav';
import { Suspense } from 'react';

import PrivyProviderWrapper from '../components/privyProvider';

export const metadata = {
  title: 'Next.js App Router + NextAuth + Tailwind CSS',
  description:
    'A user admin dashboard configured with Next.js, Postgres, NextAuth, Tailwind CSS, TypeScript, ESLint, and Prettier.'
};

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: {
    tag: string;
    item: string;
  };
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full" suppressHydrationWarning={true}>
        <Suspense>
          <Nav />
        </Suspense>
        <PrivyProviderWrapper>{children}</PrivyProviderWrapper>
        <Analytics />
      </body>
    </html>
  );
}
