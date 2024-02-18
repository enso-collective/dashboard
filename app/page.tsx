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
<<<<<<< HEAD
  }, [ready, authenticated, login]);
=======
  }, [ready, authenticated]);
>>>>>>> 18fe6773f5a9e05fb4b1cf2f26370bff25c2867b

  if (ready && authenticated) {
    return <ProfilePage />;
  }
  return <Empty />;
}
