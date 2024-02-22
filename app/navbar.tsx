'use client';

import { Fragment, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { usePrivy, WalletWithMetadata } from '@privy-io/react-auth';
import { publicClient } from '../lib/utils';

const defaultAvatarUrl = `https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2Fleerob.png?alt=media&token=eedc1fc0-65dc-4e6e-a546-ad3840afa293`;

const navigation = [
  { name: 'Profile', href: '/' },
  { name: 'Home', href: '/home' },
  { name: 'Quests', href: '/quests' }
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { authenticated, login, logout, user } = usePrivy();
  const pathname = usePathname();

  const [avatar, setAvatar] = useState(defaultAvatarUrl);
  const linkedAccounts = user?.linkedAccounts || [];
  const wallets: WalletWithMetadata[] = Object.assign(
    [],
    linkedAccounts.filter((a) => a.type === 'wallet')
  ).sort((a: WalletWithMetadata, b: WalletWithMetadata) =>
    a.verifiedAt.toLocaleString().localeCompare(b.verifiedAt.toLocaleString())
  ) as WalletWithMetadata[];
  useEffect(() => {
    const resolveEnsAvatar = async () => {
      const currentWallet = wallets[0];
      const cachedAvatar = localStorage.getItem(currentWallet.address);
      if (cachedAvatar) {
        return setAvatar(cachedAvatar);
      }
      const ensName = await publicClient.getEnsName({
        address: `${currentWallet.address}` as any
      });
      if (ensName) {
        const ensAvatar = await publicClient.getEnsAvatar({ name: ensName });
        if (ensAvatar) {
          localStorage.setItem(currentWallet.address, ensAvatar);
          setAvatar(ensAvatar);
        }
      }
    };
    if (wallets.length > 0) {
      resolveEnsAvatar().catch(console.log);
    }
  }, [wallets.length]);

  return (
    <Disclosure as="nav" className="bg-white shadow-sm">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between flex-grow">
              <div className="flex flex-shrink-0 items-center ">
                <img
                  width="100"
                  height="75"
                  src="https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2FLogo%20embellished%20black%20tm.png?alt=media&token=caa74f70-8cb8-4de6-a045-b6be9a78d45f"
                  alt="logo"
                />
              </div>
              <div className="flex">
                <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) =>
                    item.href === '/' ? (
                      <a
                        key={item.name}
                        href={item.href}
                        className={
                          'no-underline ' +
                          classNames(
                            pathname === item.href
                              ? 'border-slate-500 text-gray-900'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                          )
                        }
                        aria-current={
                          pathname === item.href ? 'page' : undefined
                        }
                      >
                        {item.name}
                      </a>
                    ) : (
                      <span
                        key={item.name}
                        className={
                          'no-underline ' +
                          classNames(
                            'border-transparent text-gray-300 ',
                            'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer floating-callout'
                          )
                        }
                      >
                        {item.name}
                      </span>
                    )
                  )}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-[46px] w-[46px] rounded-full"
                        src={avatar}
                        height={44}
                        width={44}
                        alt={`avatar`}
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {authenticated ? (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'flex w-full px-4 py-2 text-sm text-gray-700'
                              )}
                              onClick={() => logout()}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      ) : (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'flex w-full px-4 py-2 text-sm text-gray-700'
                              )}
                              onClick={() => login()}
                            >
                              Sign in
                            </button>
                          )}
                        </Menu.Item>
                      )}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pt-2 pb-3">
              {navigation.map((item) =>
                item.href === '/' ? (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                      pathname === item.href
                        ? 'bg-slate-50 border-slate-500 text-slate-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                      'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                    )}
                    aria-current={pathname === item.href ? 'page' : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ) : (
                  <span
                    key={item.name}
                    className={classNames(
                      'border-transparent text-gray-300 ',
                      'block pl-3 pr-4 py-2 border-l-4 text-base font-medium floating-callout-x'
                    )}
                    aria-current={pathname === item.href ? 'page' : undefined}
                  >
                    {item.name}
                  </span>
                )
              )}
            </div>
            <div className="border-t border-gray-200 pt-4 pb-3">
              {authenticated ? (
                <>
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-[46px] w-[46px] rounded-full"
                        src={avatar}
                        height={44}
                        width={44}
                        alt={`Avatar`}
                      />
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <button
                      onClick={() => logout()}
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-3 space-y-1">
                  <button
                    onClick={() => login()}
                    className="flex w-full px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Sign in
                  </button>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
