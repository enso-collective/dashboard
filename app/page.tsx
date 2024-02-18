'use client';
import React, { useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import ProfilePage from '../components/profilePage';
import Empty from '../components/empty';

export default function IndexPage() {
  const { ready, authenticated, login } = usePrivy();
  const cachedCountRef = useRef(0);

  console.log(cachedCountRef);
  useEffect(() => {
    if (!authenticated && ready) {
      if (cachedCountRef.current < 1) {
        cachedCountRef.current = cachedCountRef.current + 1;
        login();
      }
    }
  }, [ready, authenticated, login]);

  if (ready && authenticated) {
    cachedCountRef.current = 0;
    return <ProfilePage />;
  }
  return <Empty />;
}
