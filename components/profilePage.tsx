'use client';

import React, { useState, useEffect } from 'react';
import {
  useMfaEnrollment,
  usePrivy,
  useWallets,
  WalletWithMetadata
} from '@privy-io/react-auth';

import AuthLinker, { ExternalLinker } from '../components/auth-linker';
import { formatWallet } from '../lib/utils';
import CanvasCard from '../components/canvas-card';
import {
  ArrowUpOnSquareIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  PlusIcon,
  UserCircleIcon,
  WalletIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import CanvasRow from '../components/canvas-row';
import CanvasCardHeader from '../components/canvas-card-header';
import Image from 'next/image';
import PrivyBlobIcon from '../components/icons/outline/privy-blob';
import GitHubIcon from '../components/icons/social/github';
import AppleIcon from '../components/icons/social/apple';
import TikTokIcon from '../components/icons/social/tiktok';
import TwitterXIcon from '../components/icons/social/twitter-x';
import FarcasterIcon from '../components/icons/social/farcaster';
import { Card, Title } from '@tremor/react';

export default function ProfilePage() {
  const {
    ready,
    authenticated,
    user,
    logout,
    linkEmail,
    linkWallet,
    unlinkEmail,
    linkPhone,
    unlinkPhone,
    linkGoogle,
    unlinkGoogle,
    linkTwitter,
    unlinkTwitter,
    linkDiscord,
    unlinkDiscord,
    linkGithub,
    unlinkGithub,
    linkApple,
    unlinkApple,
    linkLinkedIn,
    unlinkLinkedIn,
    linkTiktok,
    unlinkTiktok,
    linkFarcaster,
    unlinkFarcaster,
    getAccessToken,
    createWallet,
    exportWallet,
    unlinkWallet,
    setWalletPassword,
    login,
    connectWallet
  } = usePrivy();
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeWallet, setActiveWallet] = useState<WalletWithMetadata | null>(
    null
  );

  const { showMfaEnrollmentModal } = useMfaEnrollment();
  const { wallets: connectedWallets } = useWallets();
  const mfaEnabled = user?.mfaMethods.length ?? 0 > 0;
  const linkedAccounts = user?.linkedAccounts || [];
  const wallets = linkedAccounts.filter(
    (a) => a.type === 'wallet'
  ) as WalletWithMetadata[];
  const hasSetPassword = wallets.some(
    (w) =>
      w.walletClientType === 'privy' && w.recoveryMethod === 'user-passcode'
  );

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
  const embeddedWallet = wallets.filter(
    (wallet) => wallet.walletClient === 'privy'
  )?.[0];

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
            <Title className="mb-3">Pre-Shefi Summit Quests</Title>
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
              socialIcon={
                <EnvelopeIcon
                  className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 mr-1.5"
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

            <ExternalLinker
              url="https://example.com"
              icon={
                <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
                  <FarcasterIcon height={18} width={18} />
                </div>
              }
              label="Farcaster"
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
                  onClick={linkWallet}
                >
                  <PlusIcon className="h-4 w-4" strokeWidth={2} />
                  Link a Wallet
                </button>
              </div>
            </CanvasCard>

            {embeddedWallet ? (
              <CanvasCard>
                <CanvasCardHeader>
                  <PrivyBlobIcon
                    className="h-5 w-5 shrink-0 grow-0 mr-2"
                    strokeWidth={2}
                  />
                  <div className="w-full">Embedded Wallet</div>
                  <div className="flex shrink-0 grow-0 flex-row items-center justify-end gap-x-1 text-privy-color-foreground-3">
                    {formatWallet(embeddedWallet.address)}
                  </div>
                </CanvasCardHeader>
                <div className="text-sm text-privy-color-foreground-3">
                  A user&apos;s embedded wallet is theirs to keep, and even take
                  with them.
                </div>
                <div className="flex flex-col gap-2 pt-4">
                  {!hasSetPassword && (
                    <button
                      className="button h-10 gap-x-1 px-4 text-sm"
                      disabled={!(ready && authenticated)}
                      onClick={setWalletPassword}
                    >
                      <ShieldCheckIcon className="h-4 w-4" strokeWidth={2} />
                      Set a recovery password
                    </button>
                  )}
                  <button
                    className="button h-10 gap-x-1 px-4 text-sm"
                    disabled={!(ready && authenticated)}
                    onClick={exportWallet}
                  >
                    <ArrowUpOnSquareIcon className="h-4 w-4" strokeWidth={2} />
                    Export Embedded wallet
                  </button>
                </div>
              </CanvasCard>
            ) : (
              // If they don't have an Embedded Wallet
              <CanvasCard>
                <CanvasCardHeader>
                  <PrivyBlobIcon
                    className="h-5 w-5 shrink-0 grow-0 mr-2"
                    strokeWidth={2}
                  />
                  Embedded Wallet
                </CanvasCardHeader>
                <div className="text-sm text-privy-color-foreground-3">
                  With Privy, even non web3 natives can enjoy the benefits of
                  life on chain.
                </div>
                <div className="flex flex-col gap-2 pt-4">
                  <button
                    className="button h-10 gap-x-1 px-4 text-sm"
                    disabled={!(ready && authenticated)}
                    onClick={() => {
                      createWallet();
                    }}
                  >
                    <PlusIcon className="h-4 w-4" strokeWidth={2} />
                    Create an Embedded Wallet
                  </button>
                </div>
              </CanvasCard>
            )}
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
                    <EnvelopeIcon
                      className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 mr-1.5"
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
                    <DevicePhoneMobileIcon
                      className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 mr-1.5"
                      strokeWidth={2}
                    />
                  }
                  label="Phone"
                  linkedLabel={`${phoneNumber}`}
                  canUnlink={canRemoveAccount}
                  isLinked={!!phoneNumber}
                  unlinkAction={() => {
                    unlinkPhone(phoneNumber as string);
                  }}
                  linkAction={linkPhone}
                />

                <AuthLinker
                  socialIcon={
                    <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 mr-1.5">
                      <Image
                        src="/social-icons/color/google.svg"
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
                    <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 mr-1.5">
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
                    <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 mr-1.5">
                      <Image
                        src="/social-icons/color/discord.svg"
                        height={20}
                        width={20}
                        alt="Discord"
                      />
                    </div>
                  }
                  label="Discord"
                  linkedLabel={`${discordUsername}`}
                  canUnlink={canRemoveAccount}
                  isLinked={!!discordSubject}
                  unlinkAction={() => {
                    unlinkDiscord(discordSubject as string);
                  }}
                  linkAction={linkDiscord}
                />

                <AuthLinker
                  socialIcon={
                    <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 mr-1.5">
                      <GitHubIcon height={18} width={18} />
                    </div>
                  }
                  label="Github"
                  linkedLabel={`${githubUsername}`}
                  canUnlink={canRemoveAccount}
                  isLinked={!!githubSubject}
                  unlinkAction={() => {
                    unlinkGithub(githubSubject as string);
                  }}
                  linkAction={linkGithub}
                />

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
                <AuthLinker
                  socialIcon={
                    <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 mr-1.5">
                      <Image
                        src="/social-icons/color/linkedin.svg"
                        height={20}
                        width={20}
                        alt="LinkedIn"
                      />
                    </div>
                  }
                  label="LinkedIn"
                  linkedLabel={`${linkedinName}`}
                  canUnlink={canRemoveAccount}
                  isLinked={!!linkedinSubject}
                  unlinkAction={() => {
                    unlinkLinkedIn(linkedinSubject as string);
                  }}
                  linkAction={linkLinkedIn}
                />
                <AuthLinker
                  socialIcon={
                    <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
                      <TikTokIcon height={18} width={18} />
                    </div>
                  }
                  label="TikTok"
                  linkedLabel={`${tiktokUsername}`}
                  canUnlink={canRemoveAccount}
                  isLinked={!!tiktokSubject}
                  unlinkAction={() => {
                    unlinkTiktok(tiktokSubject as string);
                  }}
                  linkAction={linkTiktok}
                />
                <AuthLinker
                  socialIcon={
                    <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground mr-1.5">
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
            </CanvasCard>
          </CanvasRow>
        </div>
      </div>
      <div style={authenticated ? { display: 'none' } : {}} id="render-privy" />
    </div>
  );
}
