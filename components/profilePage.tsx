'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePrivy, useWallets, WalletWithMetadata } from '@privy-io/react-auth';

import AuthLinker, { ExternalLinker, MintEas } from '../components/auth-linker';
import { formatWallet } from '../lib/utils';
import CanvasCard from '../components/canvas-card';

import {
  DevicePhoneMobileIcon,
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
import CapsuleIcon from '../public/wallet-icons/capsule.svg';
import GuildIcon from '../public/social-icons/guild.jpeg';
import PYUSDIcon from '../public/social-icons/pyusd.png';
import LensIcon from '../public/social-icons/lens.png';
import MetamaskIcon from '../public/wallet-icons/metamask.svg';
import HarpieIcon from '../public/social-icons/harpie.svg';
import PhaverIcon from '../public/social-icons/phaver.jpg';
import WalletConnectIcon from '../public/wallet-icons/wallet_connect.svg';
import { Card, Title } from '@tremor/react';
import { usePrivyContext } from './privyProvider';

export default function ProfilePage() {
  const {
    authenticated,
    user,
    linkWallet,
    linkGoogle,
    unlinkGoogle,
    linkTwitter,
    unlinkTwitter,
    linkApple,
    unlinkApple,
    linkFarcaster,
    unlinkFarcaster,
    unlinkWallet,
    connectWallet,
    linkEmail,
    unlinkEmail
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
  }, []);

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

  const googleSubject = user?.google?.subject;
  const googleName = user?.google?.name;

  const twitterSubject = user?.twitter?.subject;
  const twitterUsername = user?.twitter?.username;

  const appleSubject = user?.apple?.subject;
  const appleEmail = user?.apple?.email;

  const farcasterSubject = user?.farcaster?.fid;
  const farcasterName = user?.farcaster?.username;

  const emailAddress = user?.email?.address;

  const capsuleWalletAddress = wallets.find((t) =>
    t.walletClientType?.toLowerCase().includes('capsule')
  )?.address;

  const hasCapsuleWallet = Boolean(capsuleWalletAddress);

  const specifiedItemsConnected = [
    hasCapsuleWallet,
    Boolean(twitterSubject),
    Boolean(farcasterSubject),
    Boolean(activeWallet?.address)
  ].every((t) => t === true);

  return (
    <div className="griddy" style={{ justifyContent: 'flex-start' }}>
      <CanvasRow className="mb-20">
        <CanvasCard className="">
          <CanvasCardHeader>
            <WalletIcon className="h-5 w-5 mr-2" strokeWidth={2} />
            Wallets
          </CanvasCardHeader>
          <div className="pb-1 text-sm ">
            Connect and link wallets to your Proofof account.
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
                    connectedWallets.find((cw) => cw.address === wallet.address)
                      ?.walletClientType
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
              className="button h-10 gap-x-1 px-4 text-sm bg-white frosty-2"
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
      <Card className="mb-5  frosty">
        <CanvasCardHeader>
          <UserCircleIcon className="h-5 w-5" strokeWidth={2} />
          Linked Socials
        </CanvasCardHeader>
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
        <div className="flex flex-col gap-2">
          <AuthLinker
            socialIcon={
              <EnvelopeIcon
                className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0"
                strokeWidth={2}
              />
            }
            label="Email"
            linkedLabel={`${emailAddress}`}
            canUnlink={canRemoveAccount}
            isLinked={!!emailAddress}
            unlinkAction={() => {
              unlinkEmail(emailAddress as string);
            }}
            linkAction={linkEmail}
          />

          <AuthLinker
            socialIcon={
              <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0">
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2Fgoogle.svg?alt=media&token=30dc7cfc-fcef-4817-bdd9-270952b77c76"
                  height={20}
                  width={20}
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

          <AuthLinker
            className="hidden md:flex"
            socialIcon={
              <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0">
                <TwitterXIcon height={18} width={18} />
              </div>
            }
            label="Twitter"
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
              <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground">
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

          <AuthLinker
            socialIcon={
              <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground">
                <FarcasterIcon height={18} width={18} />
              </div>
            }
            label="Farcaster"
            linkedLabel={`${farcasterName}`}
            canUnlink={canRemoveAccount}
            isLinked={!!farcasterSubject}
            unlinkAction={() => {
              unlinkFarcaster(farcasterSubject as number);
            }}
            linkAction={linkFarcaster}
          />
        </div>
        {/* <ExternalLinker
          url="https://www.lens.xyz"
          icon={
            <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
              <Image src={LensIcon} height={18} width={18} alt="" />
            </div>
          }
          label="Mint your newly permissionless Lens Profile!"
        />
        <AuthLinker
          className="mb-3 mt-3"
          socialIcon={
            <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 mr-1.5">
              <TwitterXIcon height={18} width={18} />
            </div>
          }
          label="Verify Twitter to use @0xproofof quest bot"
          linkedLabel={`${twitterUsername}`}
          canUnlink={canRemoveAccount}
          isLinked={!!twitterSubject}
          unlinkAction={() => {
            unlinkTwitter(twitterSubject as string);
          }}
          linkAction={linkTwitter}
        />
        <ExternalLinker
          url="https://metamask.io/download/"
          icon={
            <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
              <Image src={MetamaskIcon} height={18} width={18} alt="" />
            </div>
          }
          label="Install Metamask on iOS/Android"
        />
        <ExternalLinker
          url="https://web3inbox.com/"
          icon={
            <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
              <Image src={WalletConnectIcon} height={18} width={18} alt="" />
            </div>
          }
          label="Download Web3Inbox PWA App"
        />
        <ExternalLinker
          url="https://web3inbox.com/"
          icon={
            <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
              <Image src={WalletConnectIcon} height={18} width={18} alt="" />
            </div>
          }
          label="Subscribe to SheFi Summit in Web3Inbox"
        />
        <ExternalLinker
          url="https://guild.xyz/shefisummit#!"
          icon={
            <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
              <Image src={GuildIcon} height={18} width={18} alt="" />
            </div>
          }
          label="Join the SheFi Summit Guild"
        />
        <ExternalLinker
          url="https://phaver.com/"
          icon={
            <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
              <Image src={PhaverIcon} height={18} width={18} alt="" />
            </div>
          }
          label="Download the Phaver App"
        />
        <ExternalLinker
          url="https://harpie.io/"
          icon={
            <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
              <Image src={HarpieIcon} height={18} width={18} alt="" />
            </div>
          }
          label="Create Harpie Account"
        />
        <ExternalLinker
          url="https://www.paypal.com/us/digital-wallet/manage-money/crypto/pyusd"
          icon={
            <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
              <Image src={PYUSDIcon} height={18} width={18} alt="" />
            </div>
          }
          label="Convert $2 USD to PYUSD in Venmo app"
        />

        <ExternalLinker
          url="https://connect.usecapsule.com"
          icon={
            <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
              <Image src={CapsuleIcon} height={13} width={13} alt="" />
            </div>
          }
          label="Create Capsule Wallet"
        />

        <ExternalLinker
          url="http://demo.usecapsule.com/"
          icon={
            <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
              <Image src={CapsuleIcon} height={13} width={13} alt="" />
            </div>
          }
          label="Mint Capsule NFT"
        />

        <AuthLinker
          className="mb-3 mt-3"
          socialIcon={
            <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 mr-1.5">
              <Image src={CapsuleIcon} height={13} width={13} alt="" />
            </div>
          }
          label="Link Capsule Wallet via WalletConnect"
          linkedLabel={`${capsuleWalletAddress}`}
          canUnlink={canRemoveAccount}
          isLinked={!!hasCapsuleWallet}
          unlinkAction={() => {
            unlinkWallet(`${capsuleWalletAddress}`);
          }}
          linkAction={() => {
            linkWallet();
          }}
        />

        <ExternalLinker
          url="https://warpcast.com/~/settings/verified-addresses"
          icon={
            <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
              <FarcasterIcon height={18} width={18} />
            </div>
          }
          label="Verify Farcaster Wallet to use @proofof quest bot"
        />
        <AuthLinker
          className="mt-3"
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
        /> */}
        {/* <MintEas disabled={!specifiedItemsConnected} /> */}
      </Card>

      {/* there should be a row here */}
    </div>
  );
  return (
    <div className=" bg-[#F9FAFB] bg-denver">
      <div className="p-4 md:p-10 mx-auto max-w-7xl">
        {/* replace griddy here */}
      </div>
      <div style={authenticated ? { display: 'none' } : {}} id="render-privy" />
    </div>
  );
}
