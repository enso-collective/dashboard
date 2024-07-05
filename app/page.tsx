'use client';
import React, { useEffect, useRef } from 'react';
import { usePrivy, useLogin } from '@privy-io/react-auth';
import Empty from '../components/empty';
import { usePrivyContext } from '../components/privyProvider';
import HomePage from '../components/homePage';
import { prviyLoginCallback } from '../lib/handleLogin';
import { redirect } from 'next/navigation';
import LensEvent from './events/lens/lens';

export default function IndexPage() {
  const { ready, authenticated } = usePrivy();

  const cachedCountRef = useRef(0);
  const { setConfig, setIsOpen } = usePrivyContext();
  const { login } = useLogin({
    onComplete: prviyLoginCallback
  });
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
        localStorage.setItem('fromLogin', 'true');
        login();
      }
    }
  }, [ready, authenticated, login]);

  if (ready && authenticated) {
    cachedCountRef.current = 0;
    if (localStorage.getItem('fromLogin')) {
      localStorage.removeItem('fromLogin');
      // setIsOpen(true);
    }
    const nextPage = localStorage.getItem('nextPage');
    if (nextPage) {
      localStorage.removeItem('nextPage');
      window.location.href = nextPage;
    }
    return <LensEvent />;
  }
  return <Empty />;
}
