'use client';

import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets, WalletWithMetadata } from '@privy-io/react-auth';

import AuthLinker, { ExternalLinker } from '../components/auth-linker';
import { formatWallet } from '../lib/utils';
import CanvasCard from '../components/canvas-card';

import {
  EnvelopeIcon,
  PlusIcon,
  UserCircleIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import CanvasRow from '../components/canvas-row';
import CanvasCardHeader from '../components/canvas-card-header';
import Image from 'next/image';
import AppleIcon from '../components/icons/social/apple';
import TwitterXIcon from '../components/icons/social/twitter-x';
import FarcasterIcon from '../components/icons/social/farcaster';
import CapsuleIcon from '../components/icons/social/capsule.svg';
import GuildIcon from '../components/icons/social/guild.jpeg';
import PYUSDIcon from '../components/icons/social/pyusd.png';
import MetamaskIcon from '../public/wallet-icons/metamask.svg';
import HarpieIcon from '../components/icons/social/harpie.svg';
import PhaverIcon from '../components/icons/social/phaver.jpg';
import WalletConnectIcon from '../public/wallet-icons/wallet_connect.svg';
import { Card, Title } from '@tremor/react';
import { usePrivyContext } from './privyProvider';

export default function ProfilePage() {
  const {
    authenticated,
    user,
    linkEmail,
    linkWallet,
    unlinkEmail,
    linkGoogle,
    unlinkGoogle,
    linkTwitter,
    unlinkTwitter,
    linkApple,
    unlinkApple,
    linkFarcaster,
    unlinkFarcaster,
    unlinkWallet,
    connectWallet
  } = usePrivy();
  const { setConfig } = usePrivyContext();
  useEffect(() => {
    setConfig((c: any) => ({
      ...c,
      _render: {
        inDialog: true,
        inParentNodeId: null
      }
    }));
    return () => {
      setConfig((c: any) => ({
        ...c,
        _render: {
          inDialog: false,
          inParentNodeId: 'render-privy'
        }
      }));
    };
  }, [setConfig]);
  const [activeWallet, setActiveWallet] = useState<WalletWithMetadata | null>(
    null
  );

  const { wallets: connectedWallets } = useWallets();
  const linkedAccounts = user?.linkedAccounts || [];
  const wallets = linkedAccounts.filter(
    (a) => a.type === 'wallet'
  ) as WalletWithMetadata[];

  const linkedAndConnectedWallets = wallets
    .filter((w) => connectedWallets.some((cw) => cw.address === w.address))
    .sort((a, b) =>
      b.verifiedAt.toLocaleString().localeCompare(a.verifiedAt.toLocaleString())
    );

  useEffect(() => {
    // if no active wallet is set, set it to the first one if available
    if (!activeWallet && linkedAndConnectedWallets.length > 0) {
      setActiveWallet(linkedAndConnectedWallets[0]!);
    }
    // if an active wallet was removed from wallets, clear it out
    if (
      !linkedAndConnectedWallets.some(
        (w) => w.address === activeWallet?.address
      )
    ) {
      setActiveWallet(
        linkedAndConnectedWallets.length > 0
          ? linkedAndConnectedWallets[0]!
          : null
      );
    }
  }, [activeWallet, linkedAndConnectedWallets]);

  const numAccounts = linkedAccounts.length || 0;
  const canRemoveAccount = numAccounts > 1;

  const emailAddress = user?.email?.address;
  const phoneNumber = user?.phone?.number;

  const googleSubject = user?.google?.subject;
  const googleName = user?.google?.name;

  const twitterSubject = user?.twitter?.subject;
  const twitterUsername = user?.twitter?.username;

  const discordSubject = user?.discord?.subject;
  const discordUsername = user?.discord?.username;

  const githubSubject = user?.github?.subject;
  const githubUsername = user?.github?.username;

  const linkedinSubject = user?.linkedin?.subject;
  const linkedinName = user?.linkedin?.name;

  const appleSubject = user?.apple?.subject;
  const appleEmail = user?.apple?.email;

  const tiktokSubject = user?.tiktok?.subject;
  const tiktokUsername = user?.tiktok?.username;

  const farcasterSubject = user?.farcaster?.fid;
  const farcasterName = user?.farcaster?.username;

  // if (!ready) {
  //   return <Loading />;
  // }

  return (
    <div className=" bg-[#F9FAFB] bg-denver">
      <div className="p-4 md:p-10 mx-auto max-w-7xl">
        <div className="griddy">
          <Card className="mb-5 grid-span">
            <Title className="mb-3">SheFi Summit Quest</Title>
            {activeWallet ? (
              <AuthLinker
                className="space mb-3"
                isLinked
                wallet={activeWallet as any}
                isActive={true}
                setActiveWallet={setActiveWallet}
                key={activeWallet?.address}
                label={formatWallet(activeWallet?.address)}
                canUnlink={canRemoveAccount}
                unlinkAction={() => {
                  unlinkWallet(activeWallet?.address as string);
                }}
                walletConnectorName={activeWallet?.walletClientType}
                linkAction={linkWallet}
                isConnected={true}
                connectAction={connectWallet}
              />
            ) : null}
            <AuthLinker
              className="mb-3"
              socialIcon={
                <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 mr-1.5">
                  <TwitterXIcon height={18} width={18} />
                </div>
              }
              label="Verify Twitter to use @0xproofof bot"
              linkedLabel={`${twitterUsername}`}
              canUnlink={canRemoveAccount}
              isLinked={!!twitterSubject}
              unlinkAction={() => {
                unlinkTwitter(twitterSubject as string);
              }}
              linkAction={linkTwitter}
            />
            <AuthLinker
                  socialIcon={
                    <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 mr-1.5">
                      <Image
                        src="/social-icons/color/google.svg"
                        height={18}
                        width={18}
                        alt="Google"
                      />
                    </div>
                  }
                  label="Google"
                  linkedLabel={`${googleName}`}
                  canUnlink={canRemoveAccount}
                  isLinked={!!googleSubject}
                  unlinkAction={() => {
                    unlinkGoogle(googleSubject as string);
                  }}
                  linkAction={linkGoogle}
                />

            <ExternalLinker
              url="https://metamask.io/download/"
              icon={
                <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
                  <MetamaskIcon height={18} width={18} />
                </div>
              }
              label="Install Metamask"
            />
            <ExternalLinker
              url="https://web3inbox.com/"
              icon={
                <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
                  <WalletConnectIcon height={18} width={18} />
                </div>
              }
              label="Web3Inbox on your Phone"
            />
            <ExternalLinker
              url="https://guild.xyz/shefisummit#!"
              icon={
                <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
                  <Image src={GuildIcon} height={18} width={18} />
                </div>
              }
              label="Join the SheFi Summit Guild"
            />
            <ExternalLinker
              url="https://phaver.com/"
              icon={
                <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
                  <Image src={PhaverIcon} height={18} width={18} />
                </div>
              }
              label="Download the Phaver App"
            />
            <ExternalLinker
              url="https://harpie.io/"
              icon={
                <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
                  <HarpieIcon height={18} width={18} />
                </div>
              }
              label="Create Harpie Account"
            />
            <ExternalLinker
              url="https://help.venmo.com/hc/en-us/articles/360063753053-Cryptocurrency-FAQ"
              icon={
                <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
                  <Image src={PYUSDIcon} height={18} width={18} />
                </div>
              }
              label="Convert $2 USD to PYUSD on Venmo"
            />
            <ExternalLinker
              url="https://usecapsule.com"
              icon={
                <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
                  <CapsuleIcon height={18} width={18} />
                </div>
              }
              label="Create Capsule Wallet"
            />
            <button
                className="button h-10 gap-x-1 px-4 text-sm"
                onClick={() => {
                  linkWallet();
                }}
              >
                <PlusIcon className="h-4 w-4" strokeWidth={2} />
                Link Capsule Wallet
              </button>
            <AuthLinker
            className="mb-3"
            socialIcon={
              <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
                <FarcasterIcon height={18} width={18} />
              </div>
            }
            label="Connect Farcaster Account"
            linkedLabel={`${farcasterName}`}
            canUnlink={canRemoveAccount}
            isLinked={!!farcasterSubject}
            unlinkAction={() => {
              unlinkFarcaster(farcasterSubject as number);
            }}
            linkAction={linkFarcaster}
          />
          <ExternalLinker
              url="https://warpcast.com/~/settings/verified-addresses"
              icon={
                <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
                  <FarcasterIcon height={18} width={18} />
                </div>
              }
              label="Verify wallet on Farcaster for use of @proofof bot"
            />
          </Card>
          <CanvasRow>
            <CanvasCard className="">
              <CanvasCardHeader>
                <WalletIcon className="h-5 w-5 mr-2" strokeWidth={2} />
                Wallets
              </CanvasCardHeader>
              <div className="pb-1 text-sm text-privy-color-foreground-3">
                Connect and link wallets to your account.
              </div>
              <div className="flex flex-col gap-2">
                {wallets.map((wallet) => {
                  return (
                    <AuthLinker
                      className="space"
                      isLinked
                      wallet={wallet}
                      isActive={wallet.address === activeWallet?.address}
                      setActiveWallet={setActiveWallet}
                      key={wallet.address}
                      label={formatWallet(wallet.address)}
                      canUnlink={canRemoveAccount}
                      unlinkAction={() => {
                        unlinkWallet(wallet.address);
                      }}
                      walletConnectorName={
                        connectedWallets.find(
                          (cw) => cw.address === wallet.address
                        )?.walletClientType
                      }
                      linkAction={linkWallet}
                      isConnected={connectedWallets.some(
                        (cw) => cw.address === wallet.address
                      )}
                      connectAction={connectWallet}
                    />
                  );
                })}
                <button
                  className="button h-10 gap-x-1 px-4 text-sm"
                  onClick={() => {
                    linkWallet();
                  }}
                >
                  <PlusIcon className="h-4 w-4" strokeWidth={2} />
                  Link a Wallet
                </button>
              </div>
            </CanvasCard>
          </CanvasRow>

          <CanvasRow>
            <CanvasCard>
              <CanvasCardHeader>
                <UserCircleIcon className="h-5 w-5 mr-2" strokeWidth={2} />
                Linked Socials
              </CanvasCardHeader>
              <div className="flex flex-col gap-2">
                <AuthLinker
                  socialIcon={
                    <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
                      <AppleIcon height={18} width={18} />
                    </div>
                  }
                  label="Apple"
                  linkedLabel={`${appleEmail}`}
                  canUnlink={canRemoveAccount}
                  isLinked={!!appleSubject}
                  unlinkAction={() => {
                    unlinkApple(appleSubject as string);
                  }}
                  linkAction={linkApple}
                />
              </div>
            </CanvasCard>
          </CanvasRow>
        </div>
      </div>
      <div style={authenticated ? { display: 'none' } : {}} id="render-privy" />
    </div>
  );
}
