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
    points: 5
  },
  {
    title: 'Lens Connection',
    subtitle: 'Create a Lens Handle — if you do not already have one',
    link: 'https://www.lens.xyz/mint',
    image:
      'https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2FIcon-Black_%402x.png?alt=media&token=d04dabca-99af-4f70-93d8-8fb77ac7de8b',
    points: 5
  },
  {
    title: 'FitCheck for Brussels',
    subtitle:
      'Upload your Fit Check for SheFi Summit Brussels, and tag @proofof for points',
    link: 'https://hey.xyz/?text=Getting+ready+for+SheFi+Summit+in+Brussels+with+the+girls+%40Proofof+%23SheFiSummitBrussels',
    image:
      'https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2FIcon-Black_%402x.png?alt=media&token=d04dabca-99af-4f70-93d8-8fb77ac7de8b',
    points: 5
  },

  {
    title: 'Harpie Connection',
    subtitle: 'Create an account on Harpie',
    link: 'https://harpie.io/onboarding/basic/',
    image:
      'https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2FHarpie-Aeonik-Logo.png?alt=media&token=0d884663-18b5-464d-b3c9-ca8a406c79d0',
    points: 5
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
            <Title>SheFi Summit Pre-Quests</Title>

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
                      {t.link && t.link.startsWith('/') ? (
                        // Uncomment the following lines when you want to make the links starting with '/' clickable
                        <Link href={t.link}>
                          <ArrowUpRightIconWithGradient />
                        </Link>
                      ) : (
                        // <ArrowUpRightIconWithGradient />
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
