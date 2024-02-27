'use client';
import React, { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { redirect } from 'next/navigation';
import Empty from '../../components/empty';
import NewProfilePage from '../../components/newProvfilePage';

export default function Home() {
  const { ready, authenticated } = usePrivy();
  useEffect(() => {
    if (!authenticated && ready) {
      redirect('/');
    }
  }, [ready, authenticated]);

  if (ready && authenticated) {
    return <NewProfilePage />;
  }

  return <Empty />;
}
