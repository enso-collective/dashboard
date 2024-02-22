'use client';
import React, { useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import ProfilePage from '../components/profilePage';
import Empty from '../components/empty';
import { usePrivyContext } from '../components/privyProvider';

export default function IndexPage() {
  const { ready, authenticated, login } = usePrivy();
  const cachedCountRef = useRef(0);
  const { setConfig } = usePrivyContext();
  useEffect(() => {
    setConfig((c: any) => ({
      ...c,
      _render: {
        inDialog: false,
        inParentNodeId: 'render-privy'
      }
    }));
  }, []);
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
