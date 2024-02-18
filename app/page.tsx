'use client';
import React, { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import ProfilePage from '../components/profilePage';
import Empty from '../components/empty';

export default function IndexPage() {
  const { ready, authenticated, login } = usePrivy();

  useEffect(() => {
    if (!authenticated && ready) {
      login();
    }
  }, [ready, authenticated, login]);

  if (ready && authenticated) {
    return <ProfilePage />;
  }
  return <Empty />;
}
