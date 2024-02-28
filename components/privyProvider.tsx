'use client';
import { PrivyProvider } from '@privy-io/react-auth';
import { createContext, useContext, useState, ReactNode } from 'react';

const defaultConfig = {
  appearance: {
    showWalletLoginFirst: true
  },
  _render: {
    inDialog: true,
    inParentNodeId: null
  },
  loginMethods: [
    'wallet'
  ]
};
interface PrivyConfigObject {
  appearance: {
    showWalletLoginFirst: boolean;
  };
  _render: {
    inDialog: boolean;
    inParentNodeId: string | null;
  };
  loginMethods: string[];
}
interface PrivyContextObject {
  config: PrivyConfigObject;
  setConfig: Function;
}

export const PrivyContext = createContext<any>({});

export const usePrivyContext = () => useContext(PrivyContext);

export default function PrivyProviderWrapper({
  children
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState({ ...defaultConfig });

  return (
    <PrivyContext.Provider value={{ config, setConfig }}>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
        // @ts-ignore
        config={config}
      >
        {children}
      </PrivyProvider>
    </PrivyContext.Provider>
  );
}
