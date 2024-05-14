'use client';
import { PrivyProvider } from '@privy-io/react-auth';
import { createContext, useContext, useState, ReactNode } from 'react';
import {
  base,
  baseGoerli,
  mainnet,
  sepolia,
  polygon,
  polygonMumbai,
  lukso
} from 'viem/chains';

const defaultConfig = {
  supportedChains: [
    mainnet,
    sepolia,
    base,
    baseGoerli,
    polygon,
    polygonMumbai,
    lukso
  ],
  appearance: {
    showWalletLoginFirst: true
  },
  _render: {
    inDialog: true,
    inParentNodeId: null
  },
  loginMethods: ['wallet', 'email']
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
