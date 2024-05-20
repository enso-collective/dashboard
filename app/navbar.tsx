'use client';

import { Fragment, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { usePrivy, WalletWithMetadata } from '@privy-io/react-auth';
import { publicClient } from '../lib/utils';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
const defaultAvatarUrl = `https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2Fleerob.png?alt=media&token=eedc1fc0-65dc-4e6e-a546-ad3840afa293`;

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { authenticated, logout, user } = usePrivy();
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
              <div className="flex flex-shrink-0 ">
                <Link href={'/'} className="flex flex-col justify-center mr-8">
                  <img
                    width="100"
                    src="https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2Fwordmark%20blue.svg?alt=media&token=d7632ac6-2901-4590-8ebe-93c3edc5fceb"
                    alt="logo"
                  />
                </Link>

                <div className="hidden sm:-my-px  lg:flex sm:space-x-8">
                  <a
                    target="_blank"
                    href="https://docs.proofof.bot/"
                    className={
                      'no-underline ' +
                      classNames(
                        'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                      )
                    }
                  >
                    Docs
                  </a>

                  <DropdownHOC>
                    {(showChildren: boolean, setShowChildren: Function) => {
                      return (
                        <div
                          className="inline-flex items-center relative z-10"
                          data-item="company"
                        >
                          <div
                            data-item="company"
                            onClick={() => {
                              setShowChildren((t: boolean) => !t);
                              const handleClickOutside = (e: any) => {
                                const dataEvent =
                                  e.target.getAttribute('data-item');
                                if (dataEvent !== 'company') {
                                  setShowChildren(false);
                                  document.removeEventListener(
                                    'click',
                                    handleClickOutside
                                  );
                                }
                              };

                              document.addEventListener(
                                'click',
                                handleClickOutside
                              );
                            }}
                            className={
                              'no-underline ' +
                              classNames(
                                pathname === '/company'
                                  ? 'border-slate-500 text-gray-900'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                                ' px-1 pt-1 text-sm font-medium cursor-pointer flex'
                              )
                            }
                          >
                            <span data-item="company">Company</span>
                            <ChevronDownIcon
                              data-item="company"
                              className="-mr-1 ml-2 h-5 w-5 text-gray-600 hover:text-gray-800"
                              aria-hidden="true"
                            />
                          </div>
                          {showChildren ? (
                            <div
                              className="absolute min-w-[100px] top-[55px] z-10"
                              data-item="company"
                            >
                              <div
                                className="bg-white p-4 mt-4 rounded-md shadow-[10px_10px_71px_-7px_rgba(0,0,0,0.75)]"
                                data-item="company"
                              >
                                <a
                                  href="https://paragraph.xyz/@ensocollective.eth"
                                  target="_blank"
                                  className="block mb-3 text-gray-500 hover:text-gray-700"
                                  data-item="company"
                                >
                                  Blog
                                </a>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    }}
                  </DropdownHOC>
                </div>
              </div>
              {/* DESKTOP */}
              <div className="flex">
                <div
                  style={{ marginLeft: '-12rem' }}
                  className="hidden sm:-my-px  lg:flex sm:space-x-8"
                >
                  <a
                    href={'/'}
                    className={
                      'no-underline ' +
                      classNames(
                        pathname === '/'
                          ? 'border-slate-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                      )
                    }
                    aria-current={pathname === '/' ? 'page' : undefined}
                  >
                    Home
                  </a>
                  <DropdownHOC>
                    {(showChildren: boolean, setShowChildren: Function) => {
                      return (
                        <div
                          className="inline-flex items-center relative"
                          data-item="event"
                        >
                          <div
                            data-item="event"
                            onClick={() => {
                              setShowChildren((t: boolean) => !t);
                              const handleClickOutside = (e: any) => {
                                const dataEvent =
                                  e.target.getAttribute('data-item');
                                if (dataEvent !== 'event') {
                                  setShowChildren(false);
                                  document.removeEventListener(
                                    'click',
                                    handleClickOutside
                                  );
                                }
                              };

                              document.addEventListener(
                                'click',
                                handleClickOutside
                              );
                            }}
                            className={
                              'no-underline ' +
                              classNames(
                                pathname === '/company'
                                  ? 'border-slate-500 text-gray-900'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                                ' px-1 pt-1 text-sm font-medium cursor-pointer flex'
                              )
                            }
                          >
                            <span data-item="event">Events</span>
                            <ChevronDownIcon
                              data-item="event"
                              className="-mr-1 ml-2 h-5 w-5 text-gray-600 hover:text-gray-800"
                              aria-hidden="true"
                            />
                          </div>
                          {showChildren ? (
                            <>
                              <div
                                className="absolute min-w-[220px] top-[55px] z-10 "
                                data-item="event"
                              >
                                <div
                                  className="bg-white p-4 mt-4 rounded-md shadow-[10px_10px_71px_-7px_rgba(0,0,0,0.75)]"
                                  data-item="event"
                                >
                                  <a
                                    href="/events/lukso"
                                    className="block mb-3 text-gray-500 hover:text-gray-700"
                                    data-item="event"
                                  >
                                    LUKSO Berlin
                                  </a>
                                  <a
                                    href="/events/shefi"
                                    className="block mb-3 text-gray-500 hover:text-gray-700"
                                    data-item="event"
                                  >
                                    Shefi Summit Denver
                                  </a>
                                </div>
                              </div>
                            </>
                          ) : null}
                        </div>
                      );
                    }}
                  </DropdownHOC>

                  <a
                    href={'/profile'}
                    className={
                      'no-underline ' +
                      classNames(
                        pathname === '/profile'
                          ? 'border-slate-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                      )
                    }
                    aria-current={pathname === '/profile' ? 'page' : undefined}
                  >
                    Profile
                  </a>
                  <a
                    href={'/gallery'}
                    className={
                      'no-underline ' +
                      classNames(
                        pathname === '/gallery'
                          ? 'border-slate-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                      )
                    }
                    aria-current={pathname === '/gallery' ? 'page' : undefined}
                  >
                    Gallery
                  </a>
                </div>
              </div>
              <div className="hidden sm:ml-6 lg:flex sm:items-center">
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
                            <Link
                              href={'/'}
                              replace
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'flex w-full px-4 py-2 text-sm text-gray-700'
                              )}
                              onClick={() => {}}
                            >
                              Sign in
                            </Link>
                          )}
                        </Menu.Item>
                      )}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              <div className="-mr-2 flex items-center lg:hidden">
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

          {/* mobile */}

          <Disclosure.Panel className="lg:hidden">
            <div className="space-y-1 pt-2 pb-3">
              <Disclosure.Button
                as="a"
                href={'/'}
                className={classNames(
                  pathname === '/'
                    ? 'bg-slate-50 border-slate-500 text-slate-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                  'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                )}
                aria-current={pathname === '/' ? 'page' : undefined}
              >
                Home
              </Disclosure.Button>
              <Disclosure.Button
                as="a"
                href={'/profile'}
                className={classNames(
                  pathname === '/profile'
                    ? 'bg-slate-50 border-slate-500 text-slate-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                  'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                )}
                aria-current={pathname === '/profile' ? 'page' : undefined}
              >
                Profile
              </Disclosure.Button>

              <div className=" w-full  rounded-lg px-4 py-2 text-left text-sm font-medium border-transparent text-gray-600">
                <DropdownHOC>
                  {(showChildren: boolean, setShowChildren: Function) => {
                    return (
                      <>
                        <div
                          className="justify-between flex"
                          onClick={(e) => {
                            setShowChildren((t: boolean) => !t);
                          }}
                        >
                          <span>Events</span>
                          <ChevronDownIcon
                            className="-mr-1 ml-2 h-5 w-5 text-gray-600 hover:text-gray-800"
                            aria-hidden="true"
                          />
                        </div>
                        {showChildren ? (
                          <div className="ml-4 mt-3">
                            <a href="/events/lukso" className="block mb-3">
                              LUKSO Berlin
                            </a>
                            <a href="/events/shefi" className="block mb-3">
                              Shefi Summit Denver
                            </a>
                          </div>
                        ) : null}
                      </>
                    );
                  }}
                </DropdownHOC>
              </div>

              <Disclosure.Button
                as="a"
                href={'/gallery'}
                className={classNames(
                  pathname === '/gallery'
                    ? 'bg-slate-50 border-slate-500 text-slate-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                  'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                )}
                aria-current={pathname === '/gallery' ? 'page' : undefined}
              >
                Gallery
              </Disclosure.Button>
              <p
                onClick={() => {
                  window.open('https://docs.proofof.bot/');
                }}
                className={classNames(
                  'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                  'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                )}
              >
                Docs
              </p>
              <div className=" w-full  rounded-lg px-4 py-2 text-left text-sm font-medium border-transparent text-gray-600">
                <DropdownHOC>
                  {(showChildren: boolean, setShowChildren: Function) => {
                    return (
                      <>
                        <div
                          className="justify-between flex"
                          onClick={() => {
                            setShowChildren((t: boolean) => !t);
                          }}
                        >
                          <span>Company</span>
                          <ChevronDownIcon
                            className="-mr-1 ml-2 h-5 w-5 text-gray-600 hover:text-gray-800"
                            aria-hidden="true"
                          />
                        </div>
                        {showChildren ? (
                          <div className="ml-4 mt-3">
                            <a
                              href="https://paragraph.xyz/@ensocollective.eth"
                              target="_blank"
                            >
                              Blog
                            </a>
                          </div>
                        ) : null}
                      </>
                    );
                  }}
                </DropdownHOC>
              </div>
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
                  <Link
                    href={'/'}
                    replace
                    className="flex w-full px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

const DropdownHOC = ({ children }: any) => {
  const [showChildren, setShowChildren] = useState(false);
  return <>{children(showChildren, setShowChildren)}</>;
};
