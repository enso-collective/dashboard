'use client';
import React, { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import HomePage from './../../components/homePage';
import { redirect } from 'next/navigation';
import Empty from '../../components/empty';

export default function Home() {
  const { ready, authenticated } = usePrivy();
  useEffect(() => {
    if (!authenticated && ready) {
      redirect('/');
    }
  }, [ready, authenticated]);

  if (ready && authenticated) {
    return <HomePage />;
  }

  return <Empty />;
}
