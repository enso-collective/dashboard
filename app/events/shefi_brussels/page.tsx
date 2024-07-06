'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, Subtitle, Title } from '@tremor/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  or,
  where,
  startAfter
} from 'firebase/firestore/lite';
import { db } from './../../../lib/firebase';
import { usePrivy, useWallets, WalletWithMetadata } from '@privy-io/react-auth';
import { chunker, getAvatar, getEnsName, sleep } from '../../../lib/utils';
import { MoonLoader } from 'react-spinners';
import { redirect } from 'next/navigation';
import Empty from '../../../components/empty';
import GiganticLoader from '../../../components/giganticLoader';
import ArrowUpRightIconWithGradient from '../../../components/icons/social/arrowTopRight';
import GallryImageCard from '../../../components/galleryImageCard';
import Link from 'next/link';
import { Tooltip } from 'react-tooltip';
import FarcasterIcon from '../../../components/icons/social/farcaster';
import TwitterXIcon from '../../../components/icons/social/twitter-x';
import LensIcon from '../../../components/icons/solid/lens';

export interface User {
  poapId: string[];
  attestationUID: string[];
  proofs: string[];
  attestWallet: string;
  points: number;
  image: string;
  ensName: string;
  userWallet: string;
  luksoAddress: string;
  pointValueLukso: number;
  id: string;
  buildersPoints: number;
}

export interface MerchItem {
  description: string;
  image: string;
  link: string;
  name: string;
  points: string;
}

export interface Attestation {
  poapId: string;
  image: boolean;
  pointValue: number;
  attestationUID: string;
  poapName: string;
  userWalletLower: string;
  userWallet: string;
  transaction: string;
  timestamp: number;
  ipfsImageURL: string;
  postContent: string;
  postURL: string;
  questId: string;
  username: string;
  ensName: string;
  ensAvatar: string;
  quest: string;
}
const events = [
  {
    title: 'Twitter Connection',
    subtitle: 'Connect your Twitter in the Profile section to use the AI bot',
    link: '/profile',
    image:
      'https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2FX_logo.jpg?alt=media&token=03d2222b-e7db-4a0a-a9e6-6a7c75fb0c8b',
    points: 5,
    isActive: true
  },
  {
    title: 'Lens Connection',
    subtitle: 'Create a Lens Handle — if you do not already have one',
    link: 'https://www.lens.xyz/mint',
    image:
      'https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2FIcon-Black_%402x.png?alt=media&token=d04dabca-99af-4f70-93d8-8fb77ac7de8b',
    points: 5,
    isActive: true
  },
  {
    title: 'FitCheck for Brussels',
    subtitle:
      'Upload your Fit Check for SheFi Summit Brussels, and tag @proofof for points',
    link: 'https://hey.xyz/?text=Getting+ready+for+SheFi+Summit+in+Brussels+with+the+girls+%40Proofof+%23SheFiSummitBrussels',
    image:
      'https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2FIcon-Black_%402x.png?alt=media&token=d04dabca-99af-4f70-93d8-8fb77ac7de8b',
    points: 5,
    isActive: true
  },

  {
    title: 'Harpie Connection',
    subtitle: 'Create an account on Harpie',
    link: 'https://harpie.io/onboarding/basic/',
    image:
      'https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2FHarpie-Aeonik-Logo.png?alt=media&token=0d884663-18b5-464d-b3c9-ca8a406c79d0',
    points: 5,
    isActive: true
  },
  {
    title: 'Earn Points for SheFi Talks',
    subtitle: 'Attend talks and earn points by collecting POAPs',
    link: '/',
    image:
      'https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2Fshefilogo.png?alt=media&token=16fe367f-eeaf-4750-837a-66e0bd0389be',
    points: 5,
    isActive: false
  },
  {
    title: 'Connect and Earn with Stellar',
    subtitle:
      'Earn points by connecting your passkey at the Stellar booth and share your experience on socials tagging @Proofof on Lens and @0xproofof on (X)',
    link: 'https://orb.club/@proofof',
    image:
      'https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2FStellar%20Logo%20Final%20RGB.svg?alt=media&token=ff549e2b-802f-46c9-af8c-5cc25716c0bb',
    points: 5,
    isActive: true,
    twitterLink: `https://twitter.com/intent/tweet?text=I%20just%20connected%20my%20passkey%20at%20the%20Stellar%20booth%20during%20the%20SheFi%20Summit%20Brussels%20%40StellarOrg%20%40shefiorg%20%400xproofof`
  },
  {
    title: 'Collect Exclusive Harpie POAPs',
    subtitle:
      'Visit the Harpie booth to collect unique POAP’s for exclusive merch',
    link: 'https://harpie.io/onboarding/basic/',
    image:
      'https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2FHarpie-Aeonik-Logo.png?alt=media&token=0d884663-18b5-464d-b3c9-ca8a406c79d0',
    points: 5,
    isActive: false
  },
  {
    title: 'Bridge Ethereum to RARI',
    subtitle:
      'Head over to https://bridge.arbitrum.io/ (Link out) and bridge $1.5-2 USD worth of ETH from Ethereum to RARI Chain to cover the fees',
    link: ' https://bridge.arbitrum.io/',
    image:
      'https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2Frarible_logo_icon_248698.png?alt=media&token=8aa88583-8be9-40b2-92e1-14b96de3efe5',
    points: 5,
    isActive: true
  },
  {
    title: 'Mint Rari NFT',
    subtitle: 'Once you have ETH on RARI Chain, and mint your Poor Fella NFT',
    link: 'https://rarible.com/collection/rari/0xB17e1C774707a2a8eDeD2497e53985Bbe6B2DA19/drops',
    image:
      'https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2Frarible_logo_icon_248698.png?alt=media&token=8aa88583-8be9-40b2-92e1-14b96de3efe5',
    points: 5,
    isActive: true
  },
  {
    title: 'Showcase Your Minted Rari NFT',
    subtitle:
      'Tweet out about the mint tagging @RariChain @shefiorg @0xproofof to complete your attestation & be eligible to get swag & a future RARI distribution :purple_heart:',
    link: 'https://orb.club/@proofof',
    image:
      'https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2Frarible_logo_icon_248698.png?alt=media&token=8aa88583-8be9-40b2-92e1-14b96de3efe5',
    points: 5,
    isActive: true,
    twitterLink: `https://twitter.com/intent/tweet?text=I%20just%20minted%20my%20%22Poor%20Fella%27s%20NFT%22%20by%20Alyssa%20Mae%20at%20the%20SheFi%20Summit%20Brussels%20%40RariChain%20%40shefiorg%20%400xproofof`
  },
  {
    title: 'Capture Your Custom Linea PFP',
    subtitle:
      'Take a photo of your customized sketch and share it on Twitter using the hashtag #OnLinea and tag @0xProofof #SheFiSummitxLinea',
    link: '/',
    image:
      'https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2Flinea-logo-png_seeklogo-527155.png?alt=media&token=870b5428-2133-4b83-ad97-67870d32aac1',
    points: 5,
    isActive: false
  }
];
export default function ShefiBrusselsEvent() {
  const [expandQuests, setExpandQuests] = useState(true);
  const [expandLeaderboard, setExpandLeaderboard] = useState(true);
  const [expandGallery, setExpandGallery] = useState(true);
  const [items, setItems] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const loaderRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const usersRef = useRef(collection(db, 'User'));
  const [users, setUsers] = useState<User[]>([]);
  const { authenticated, ready, user } = usePrivy();
  const questsRef = useRef(collection(db, 'Quest'));
  const [quests, setQuests] = useState<MerchItem[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(true);
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [gallery, setGallery] = useState<Attestation[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const proofsRef = useRef(collection(db, 'Proof'));

  useEffect(() => {
    if (!authenticated && ready) {
      localStorage.setItem('nextPage', window.location.href);
      redirect('/');
    }
  }, [ready, authenticated]);

  useEffect(() => {
    getDocs(
      query(
        usersRef.current,
        orderBy('shefiPoints', 'desc'),
        where('shefiPoints', '>', 0),
        limit(100)
      )
    )
      .then((snapshot) => {
        const tempArr: any[] = [];
        snapshot.forEach((d) => tempArr.push(d.data() as any));
        setUsers(tempArr);
      })
      .catch(console.log);
  }, [setUsers]);

  useEffect(() => {
    if (users.length > 0) {
      const resolveEnsAvatars = async () => {
        try {
          // @ts-ignore
          for (const chunk of chunker(users, 10)) {
            const items = await Promise.allSettled(
              [...chunk].map(async (t) => {
                const tempObj = { ...t };
                const ensName = await getEnsName(t.userWallet);
                if (ensName) {
                  const ensAvatar = await getAvatar(ensName);
                  if (ensAvatar) {
                    return { ...tempObj, image: ensAvatar, ensName };
                  }
                  return { ...tempObj, ensName };
                }
                return tempObj;
              })
            );
            const filteredItems = items.filter(
              (d) => d.status === 'fulfilled'
            ) as any;
            setItems((t) => [...t, ...filteredItems.map((d: any) => d.value)]);
            await sleep(5000);
          }
        } catch (error) {
          console.log(error);
        } finally {
        }
      };
      resolveEnsAvatars()
        .finally(() => {})
        .catch(console.error);
    }
  }, [users]);
  if (ready && authenticated) {
    return (
      <div className="bg-brussels min-h-screen">
        <div className="p-4 md:p-10 mx-auto max-w-4xl">
          <button
            className="mb-5 frosty p-2 rounded-sm flex justify-between items-center w-[100%]"
            onClick={() => {
              setExpandQuests((t) => !t);
            }}
          >
            <Title>Quests</Title>

            <ChevronDownIcon
              className="-mr-1 ml-2 h-10 w-10 text-black"
              aria-hidden="true"
            />
          </button>
          {expandQuests ? (
            <div className="mb-10">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,1fr))] gap-y-2 gap-x-2 mt-2.5 grid-auto-rows-minmax mr-auto ml-auto">
                {events.map((t) => (
                  <Card
                    key={t.title}
                    className="flex flex-col quest-card bg-white"
                  >
                    <div className="mt-1 mb-5 flex items-center flex-row">
                      <img
                        src={t.image}
                        width={40}
                        height={40}
                        alt=""
                        className="rounded-2xl mr-2 object-cover"
                      />
                      <p className="font-medium">{t.title}</p>
                    </div>
                    <p className="mb-5  text-sm text-gray-600">{t.subtitle}</p>

                    <div className="flex flex-row justify-between items-center mt-[auto]">
                      <p>+{t.points} points</p>
                      <Tooltip id="shefi-tooltip" />
                      {!t.isActive ? (
                        <div
                          data-tooltip-id="shefi-tooltip"
                          data-tooltip-content="Coming soon"
                          data-tooltip-place="top"
                        >
                          <ArrowUpRightIconWithGradient />
                        </div>
                      ) : t.link && t.link.startsWith('/') ? (
                        <Link href={t.link}>
                          <ArrowUpRightIconWithGradient />
                        </Link>
                      ) : t.twitterLink ? (
                        <div className="flex">
                          <a
                            className="mr-3"
                            href={t.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <LensIcon height={18} width={18} />
                          </a>
                          <a
                            href={t.twitterLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <TwitterXIcon height={18} width={18} />
                          </a>
                        </div>
                      ) : (
                        <a
                          href={t.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ArrowUpRightIconWithGradient />
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
                {/* {quests.map((t) => (
                  <Card
                    key={t.name}
                    className="flex flex-col quest-card bg-white"
                  >
                    <div className="mt-1 mb-5 flex items-center flex-row">
                      <img
                        src={`https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2F${t.image}.png?alt=media&token=16fe367f-eeaf-4750-837a-66e0bd0389be`}
                        width={40}
                        height={40}
                        alt=""
                        className="rounded-2xl mr-2 object-cover"
                      />
                      <p className="font-medium">{t.name}</p>
                    </div>
                    <p className="mb-5 capitalize text-sm text-gray-600">
                      {t.description}
                    </p>

                    <div className="flex flex-row justify-between items-center mt-[auto]">
                      <p>+{t.points} points</p>
                      {t.link && t.link.startsWith('/') ? (
                        // Uncomment the following lines when you want to make the links starting with '/' clickable
                        // <Link href={t.link}>
                        //   <a>
                        //     <ArrowUpRightIconWithGradient />
                        //   </a>
                        // </Link>
                        <ArrowUpRightIconWithGradient />
                      ) : (
                        <a
                          href={t.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ArrowUpRightIconWithGradient />
                        </a>
                      )}
                    </div>
                  </Card>
                ))} */}
              </div>
            </div>
          ) : (
            <></>
          )}
          <button
            className="mb-5 frosty p-2 rounded-sm flex justify-between items-center w-[100%]"
            onClick={() => {
              setExpandLeaderboard((t) => !t);
            }}
          >
            <Title>Leaderboard</Title>

            <ChevronDownIcon
              className="-mr-1 ml-2 h-10 w-10 text-black"
              aria-hidden="true"
            />
          </button>

          {expandLeaderboard ? (
            <>
              <div className="leaderboard">
                {items.map((t, index) => (
                  <div className="list-fix" key={t.userWallet}>
                    <div className="number-col">#{index + 1}</div>
                    <div className="list-body pl-4 pr-4">
                      <div className="flex flex-row items-center">
                        {t.image ? (
                          <img
                            className="rounded-full mr-2"
                            width="30"
                            height="30"
                            src={t.image}
                            alt="logo"
                          />
                        ) : (
                          <img
                            className="rounded-full mr-2 grayscale"
                            width="30"
                            height="30"
                            src="https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2Fleerob.png?alt=media&token=eedc1fc0-65dc-4e6e-a546-ad3840afa293"
                            alt="logo"
                          />
                        )}

                        <div className="list-wrap">
                          {/* @ts-ignore */}
                          {t.ensName || t.twitterUsername || t.userWallet}
                        </div>
                      </div>

                      <p className="basis-24 flex-shrink-0 text-right">
                        <span>
                          {/* @ts-ignore */}
                          {new Intl.NumberFormat().format(t.shefiPoints)}
                        </span>{' '}
                        points
                      </p>
                    </div>
                  </div>
                ))}

                <div className="bg-transparent min-h-12  mt-5 h-12 flex flex-row justify-center"></div>
              </div>
            </>
          ) : null}

          <button
            className="mb-5 frosty p-2 rounded-sm flex justify-between items-center w-[100%]"
            onClick={() => {
              setExpandGallery((t) => !t);
            }}
          >
            <Title>Gallery</Title>

            <ChevronDownIcon
              className="-mr-1 ml-2 h-10 w-10 text-black"
              aria-hidden="true"
            />
          </button>
          {expandGallery ? (
            <>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,1fr))] gap-y-1 gap-x-1 mt-2.5 grid-auto-rows-minmax mr-auto ml-auto">
                {attestations.map((t) => (
                  <GallryImageCard t={t} key={t.timestamp} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  return <Empty />;
}
