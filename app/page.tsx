'use client';
import React, { useEffect, useRef } from 'react';
import { usePrivy, useLogin } from '@privy-io/react-auth';
import Empty from '../components/empty';
import { usePrivyContext } from '../components/privyProvider';
import HomePage from '../components/homePage';
import { prviyLoginCallback } from '../lib/handleLogin';

export default function IndexPage() {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin({
    onComplete: prviyLoginCallback
  });
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
    return <HomePage />;
  }
  return <Empty />;
}
