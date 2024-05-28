'use client';
import React, { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { redirect } from 'next/navigation';
import Empty from '../../components/empty';
import ProfilePage from '../../components/profilePage';

export default function Home() {
  const { ready, authenticated } = usePrivy();
  useEffect(() => {
    if (!authenticated && ready) {
      localStorage.setItem('nextPage', window.location.href);
      redirect('/');
    }
  }, [ready, authenticated]);

  if (ready && authenticated) {
    return <ProfilePage />;
  }

  return <Empty />;
}
