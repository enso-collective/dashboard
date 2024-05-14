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
import { chunker, publicClient, sleep } from '../../../lib/utils';
import { MoonLoader } from 'react-spinners';
import { redirect } from 'next/navigation';
import Empty from '../../../components/empty';
import GiganticLoader from '../../../components/giganticLoader';
import ArrowUpRightIconWithGradient from '../../../components/icons/social/arrowTopRight';
import GallryImageCard from '../../../components/galleryImageCard';

interface User {
  poapId: string[];
  attestationUID: string[];
  proofs: string[];
  attestWallet: string;
  points: number;
  image: string;
  ensName: string;
  userWallet: string;
}

interface MerchItem {
  description: string;
  image: string;
  link: string;
  name: string;
  points: string;
}

interface Attestation {
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

export default function ShefiEvent() {
  const [expandQuests, setExpandQuests] = useState(true);
  const [expandLeaderboard, setExpandLeaderboard] = useState(false);
  const [expandGallery, setExpandGallery] = useState(false);
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
      redirect('/');
    }
  }, [ready, authenticated]);
  useEffect(() => {
    getDocs(questsRef.current)
      .then((snapshot) => {
        const tempArr: MerchItem[] = [];
        snapshot.forEach((d) => tempArr.push(d.data() as MerchItem));
        setQuests(
          tempArr.filter((t) => t.image.toLowerCase().includes('shefi'))
        );
        setLoadingQuests(false);
      })
      .catch(console.log);
  }, [setQuests, setLoadingQuests]);

  useEffect(() => {
    getDocs(query(usersRef.current, orderBy('points', 'desc'), limit(100)))
      .then((snapshot) => {
        const tempArr: User[] = [];
        snapshot.forEach((d) => tempArr.push(d.data() as User));
        setUsers(tempArr);
        setPage(1);
      })
      .catch(console.log);
  }, [setUsers]);

  useEffect(() => {
    if (users.length > 0) {
      const resolveEnsAvatars = async () => {
        setLoading(true);

        try {
          // @ts-ignore
          for (const chunk of chunker(users, 10)) {
            const items = await Promise.allSettled(
              [...chunk].map(async (t) => {
                const tempObj = { ...t };
                const ensName = await publicClient.getEnsName({
                  address: `${t.userWallet}` as any
                });
                if (ensName) {
                  const ensAvatar = await publicClient.getEnsAvatar({
                    name: ensName
                  });
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
          setLoading(false);
        }
      };
      resolveEnsAvatars()
        .finally(() => {
          setLoading(false);
        })
        .catch(console.error);
    }
  }, [users]);

  useEffect(() => {
    const resolveEnsAvatars = async () => {
      setLoadingGallery(true);
      let lastTimestamp: any;

      while (true) {
        const queryParams = [
          proofsRef.current,
          orderBy('timestamp', 'desc'),
          where('timestamp', '!=', 0),
          where('ipfsImageURL', '>', ''),
          where('image', '==', true)
          // orderBy('ipfsImageURL', 'desc'),
        ] as any[];

        if (lastTimestamp) {
          queryParams.push(startAfter(lastTimestamp));
          queryParams.push(limit(20));
        } else {
          queryParams.push(limit(20));
        }
        //  @ts-ignore
        const q = query(...queryParams);
        const tempArray: Attestation[] = [];
        const snapshot = await getDocs(q);

        snapshot.forEach((s) => {
          const tempData = s.data() as Attestation;
          tempArray.push(tempData);
        });
        lastTimestamp = tempArray.slice(-1)[0].timestamp;

        setAttestations((t) => [...t, ...tempArray]);
        if (tempArray.length < 20) {
          break;
        }
        await sleep(5000);
      }
    };

    resolveEnsAvatars()
      .finally(() => {
        setLoadingGallery(false);
      })
      .catch(console.log);
  }, []);

  if (ready && authenticated) {
    return (
      <div className="bg-denver min-h-screen">
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
              {loadingQuests ? <GiganticLoader /> : null}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,1fr))] gap-y-2 gap-x-2 mt-2.5 grid-auto-rows-minmax mr-auto ml-auto">
                {quests.map((t) => (
                  <Card
                    key={t.name}
                    className="flex flex-col quest-card bg-white justify-between"
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
                    <Subtitle className="mb-5 uppercase text-sm">
                      {t.description}
                    </Subtitle>
                    <div className="flex flex-row justify-between items-center">
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
                ))}
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
                          {t.ensName || t.userWallet}
                        </div>
                      </div>

                      <p className="basis-24 flex-shrink-0 text-right">
                        <span>{new Intl.NumberFormat().format(t.points)}</span>{' '}
                        points
                      </p>
                    </div>
                  </div>
                ))}

                <div className="bg-transparent min-h-12  mt-5 h-12 flex flex-row justify-center">
                  {loading ? (
                    <MoonLoader size={40} color="rgba(255,255,255,.9)" />
                  ) : null}
                </div>
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

              <div
                ref={loaderRef}
                className="bg-transparent min-h-12  mt-5 h-12 flex flex-row justify-center"
              >
                {loadingGallery ? (
                  <MoonLoader size={100} color="rgba(255,255,255,.9)" />
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  return <Empty />;
}
