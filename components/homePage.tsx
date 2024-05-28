import { Card, Title, Subtitle, Text } from '@tremor/react';
import { useEffect, useRef, useState } from 'react';
import { MoonLoader } from 'react-spinners';
import ArrowUpRightIconWithGradient from './icons/social/arrowTopRight';
import Link from 'next/link';
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  updateDoc,
  doc,
  or,
  where
} from 'firebase/firestore/lite';
import { db } from '../lib/firebase';
import { getAvatar, getEnsName, publicClient } from '../lib/utils';
import { WalletWithMetadata, usePrivy } from '@privy-io/react-auth';
import GiganticLoader from './giganticLoader';
import AuthLinker, {
  ExternalLinker,
  ExternalLinkerWithIcon,
  LuksoConnector,
  LuksoConnectorMod
} from './auth-linker';
import FarcasterIcon from './icons/social/farcaster';
import TwitterXIcon from './icons/social/twitter-x';
import LensIcon from './icons/solid/lens';
import { PlusSmallIcon } from '@heroicons/react/20/solid';
import { usePrivyContext } from './privyProvider';
import { connectLukso } from '../lib/lukso';

interface MerchItem {
  description: string;
  image: string;
  link: string;
  name: string;
  points: string;
}

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

export default function HomePage() {
  const [items, setItems] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const loaderRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const questsRef = useRef(collection(db, 'Quest'));
  const usersRef = useRef(collection(db, 'User'));
  const [quests, setQuests] = useState<MerchItem[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const {
    authenticated,
    unlinkFarcaster,
    linkFarcaster,
    user,
    linkTwitter,
    unlinkTwitter
  } = usePrivy();

  const farcasterSubject = user?.farcaster?.fid;
  const farcasterName = user?.farcaster?.username;

  const twitterSubject = user?.twitter?.subject;
  const twitterUsername = user?.twitter?.username;

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
    getDocs(questsRef.current)
      .then((snapshot) => {
        const tempArr: MerchItem[] = [];
        snapshot.forEach((d) => tempArr.push(d.data() as MerchItem));
        setQuests(tempArr);
        setLoadingQuests(false);
      })
      .catch(console.log);
  }, [setQuests, setLoadingQuests]);

  useEffect(() => {
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting) {
        setPage((prevPage) => {
          if (items.length >= prevPage * 10 && !loading && prevPage > 0) {
            return prevPage + 1;
          }
          return prevPage;
        });
      }
    };

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    });
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    const tempRefValue = loaderRef.current;
    return () => {
      if (tempRefValue) {
        observer.unobserve(tempRefValue);
      }
    };
  }, [items, setPage, loading]);

  useEffect(() => {
    const resolveEnsAvatars = async () => {
      setLoading(true);
      const items = await Promise.allSettled(
        [...users.slice(page * 10 - 10, page * 10)].map(async (t) => {
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
    };
    resolveEnsAvatars()
      .finally(() => {
        setLoading(false);
      })
      .catch(console.error);
  }, [page, users]);

  const [luksoAddress, setLuksoAddress] = useState(() => {
    try {
      return localStorage.getItem('luksoAddress');
    } catch (error) {
      return null;
    }
  });
  const [primaryWallet, setPrimaryWallet] = useState<string | null>();
  useEffect(() => {
    const linkedAccounts = user?.linkedAccounts || [];

    const wallets: WalletWithMetadata[] = Object.assign(
      [],
      linkedAccounts.filter((a: any) => a.type === 'wallet')
    ).sort((a: WalletWithMetadata, b: WalletWithMetadata) =>
      a.verifiedAt.toLocaleString().localeCompare(b.verifiedAt.toLocaleString())
    ) as WalletWithMetadata[];
    if (wallets.length > 0) {
      const addressTrimmedToLowerCase = wallets[0]?.address
        .toLowerCase()
        .trim();
      setPrimaryWallet(addressTrimmedToLowerCase);
    }
  }, [user?.linkedAccounts]);

  useEffect(() => {
    if (primaryWallet && luksoAddress) {
      const q = query(
        collection(db, 'User'),
        or(
          where('userWallet', '==', primaryWallet),
          where('userWalletToLowerCase', '==', primaryWallet),
          where('userWalletLower', '==', primaryWallet)
        ),
        limit(1)
      );
      const payload = {
        luksoAddress: luksoAddress.toLowerCase().trim()
      } as any;
      getDocs(q)
        .then(async (snapshot) => {
          if (snapshot.empty) {
            return;
          }
          snapshot.forEach(async (s) => {
            try {
              const docRef = doc(db, 'User', s.id);
              await updateDoc(docRef, { ...payload });
              console.log('Lusko profile updated!');
            } catch (error) {
              console.log(error);
            }
          });
        })
        .catch(console.log);
    }
  }, [primaryWallet, luksoAddress]);

  return (
    <div className="bg-denver min-h-screen">
      <div className="p-4 md:p-10 mx-auto max-w-4xl">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-y-2 gap-x-2 mt-2.5  mr-auto ml-auto mb-10">
          {/* <Card className="  bg-white  p-4 ">
            <div className="flex shrink-1 grow-0 items-center gap-x-2">
              <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground">
                <TwitterXIcon height={18} width={18} />
              </div>
              <div className="w-full">Twitter</div>
            </div>

            <div className="pb-2 mt-5">
              <AuthLinker
                className="frosty"
                label="Connect"
                linkedLabel={`${twitterUsername}`}
                canUnlink={true}
                isLinked={!!twitterSubject}
                unlinkAction={() => {
                  unlinkTwitter(twitterSubject as string);
                }}
                linkAction={linkTwitter}
              />

              <a
                href="https://twitter.com/"
                target="_blank"
                className="button p-2 basis-[80px] mt-3 justify-between"
              >
                <span className="text-[#000] text-sm mr-2">Post </span>
                <ArrowUpRightIconWithGradient />
              </a>
            </div>
          </Card>
          <Card className="  bg-white  p-4 ">
            <div className="flex shrink-1 grow-0 items-center gap-x-2">
              <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground">
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2Flukso.png?alt=media&token=c455efa6-2865-4ec6-b1d5-0492b9e4a66d"
                  height={18}
                  width={18}
                />
              </div>
              <div className="w-full">LUKSO Universal Profile</div>
            </div>

            <div className="pb-2 mt-5">
              <LuksoConnectorMod
                isActive={Boolean(luksoAddress)}
                label={luksoAddress ? 'Connected' : 'Connect UP'}
                action={async () => {
                  if (luksoAddress) {
                    localStorage.removeItem('luksoAddress');
                    return setLuksoAddress(null);
                  }
                  try {
                    const { account } = await connectLukso();
                    localStorage.setItem('luksoAddress', account);
                    setLuksoAddress(account);
                  } catch (error) {
                    console.error(error);
                  }
                }}
                linkedLabel={
                  luksoAddress
                    ? luksoAddress.slice(0, 5) + '...' + luksoAddress.slice(-5)
                    : undefined
                }
              />

              <a
                href="/events/lukso"
                className="button p-2 basis-[80px] mt-3 justify-between"
              >
                <span className="text-[#000] text-sm mr-2">
                  LUKSO Berlin Event{' '}
                </span>
                <ArrowUpRightIconWithGradient />
              </a>
            </div>
          </Card> */}
          <Card className="  bg-white  p-4 ">
            <div className="flex shrink-1 grow-0 items-center gap-x-2">
              <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground">
                <FarcasterIcon height={18} width={18} />
              </div>
              <div className="w-full">Farcaster</div>
            </div>

            <div className="pb-2 mt-5">
              <AuthLinker
                className="frosty"
                label="Connect"
                linkedLabel={`${farcasterName}`}
                canUnlink={false}
                isLinked={!!farcasterSubject}
                unlinkAction={() => {
                  unlinkFarcaster(farcasterSubject as number);
                }}
                linkAction={linkFarcaster}
              />

              <a
                href="https://warpcast.com/"
                target="_blank"
                className="button p-2 basis-[80px] mt-3 justify-between"
              >
                <span className="text-[#000] text-sm mr-2">Cast </span>
                <ArrowUpRightIconWithGradient />
              </a>
            </div>
          </Card>
          <Card className="  bg-white  p-4 ">
            <div className="flex shrink-1 grow-0 items-center gap-x-2">
              <div className="h-[1.125rem] w-[1.125rem] shrink-0 grow-0 text-privy-color-foreground">
                <LensIcon height={18} width={18} />
              </div>
              <div className="w-full">Lens</div>
            </div>

            <div className="pb-2 mt-5">
              <ExternalLinkerWithIcon
                url="https://www.lens.xyz/"
                label="Join"
                className="frosty"
              />

              <a
                href="https://www.lens.xyz/"
                target="_blank"
                className="button p-2 basis-[80px] mt-3 justify-between"
              >
                <span className="text-[#000] text-sm mr-2">Post </span>
                <ArrowUpRightIconWithGradient />
              </a>
            </div>
          </Card>
        </div>
        {/* <div className="mb-10">
          <Title>Quests</Title>
          {loadingQuests ? <GiganticLoader /> : null}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,1fr))] gap-y-2 gap-x-2 mt-2.5 grid-auto-rows-minmax mr-auto ml-auto">
            {quests.map((t) => (
              <Card
                key={t.name}
                className="flex flex-col quest-card bg-white justify-between"
              >
                <div className="mt-1 mb-5 flex items-center flex-row">
                  <img
                    src={`quest-icons/${t.image}.png`}
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
                    <a href={t.link} target="_blank" rel="noopener noreferrer">
                      <ArrowUpRightIconWithGradient />
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div> */}
        {/* <div className="leaderboard">
          <Title className="mb-3">Leaderboard</Title>
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

                  <div className="list-wrap">{t.ensName || t.userWallet}</div>
                </div>

                <p className="basis-24 flex-shrink-0 text-right">
                  <span>{new Intl.NumberFormat().format(t.points)}</span> points
                </p>
              </div>
            </div>
          ))}

          <div
            ref={loaderRef}
            className="bg-transparent min-h-12  mt-5 h-12 flex flex-row justify-center"
          >
            {loading ? (
              <MoonLoader size={40} color="rgba(255,255,255,.9)" />
            ) : null}
          </div>
        </div> */}
      </div>
      <div style={authenticated ? { display: 'none' } : {}} id="render-privy" />
    </div>
  );
}
