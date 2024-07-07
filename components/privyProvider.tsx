'use client';
import { PrivyProvider } from '@privy-io/react-auth';
import { createContext, useContext, useState } from 'react';
import {
  base,
  baseGoerli,
  mainnet,
  sepolia,
  polygon,
  polygonMumbai,
  lukso
} from 'viem/chains';
import { Dialog, Transition } from '@headlessui/react';
import UniversalLoader from './universalLoader';

const defaultConfig = {
  // embeddedWallets: {
  //   createOnLogin: 'users-without-wallets'
  // },
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
    walletList: [
      'coinbase_wallet',
      'metamask',
      'rainbow',
      'wallet_connect',
      'zerion',
      'phantom',
      'detected_wallets'
    ],
    showWalletLoginFirst: false
  },
  externalWallets: {
    coinbaseWallet: {
      connectionOptions: 'smartWalletOnly'
    }
  },
  _render: {
    inDialog: true,
    inParentNodeId: null
  },
  loginMethods: ['twitter', 'wallet', 'email']
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PrivyContext.Provider value={{ config, setConfig, isOpen, setIsOpen }}>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
        // @ts-ignore
        config={config}
      >
        {children}
        <UniversalLoader />
        <Guide isOpen={isOpen} setIsOpen={setIsOpen} />
      </PrivyProvider>
    </PrivyContext.Provider>
  );
}

function Guide({
  isOpen,
  setIsOpen
}: {
  isOpen: Boolean;
  setIsOpen: Function;
}) {
  function close() {
    setIsOpen(false);
  }

  return (
    <Transition appear show={isOpen as any}>
      <Dialog
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={close}
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 transform-[scale(95%)]"
              enterTo="opacity-100 transform-[scale(100%)]"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 transform-[scale(100%)]"
              leaveTo="opacity-0 transform-[scale(95%)]"
            >
              <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white p-6 backdrop-blur-2xl">
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2Fwordmark%20blue.svg?alt=media&token=3e7a9eb9-26c2-4aa3-82a0-c25a175d6167"
                  alt=""
                  style={{ width: '100%', objectFit: 'contain' }}
                  height={'200'}
                  className="mt-10"
                />
                <div className="mt-10 flex justify-center items-center ">
                  <button
                    className="p-3 px-8 rounded-lg bg-[#eee]"
                    onClick={close}
                  >
                    Continue
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
