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
  limit
} from 'firebase/firestore/lite';
import { db } from '../lib/firebase';
import { publicClient } from '../lib/utils';
import { usePrivy } from '@privy-io/react-auth';
import GiganticLoader from './giganticLoader';

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
  const { authenticated } = usePrivy();

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
    };
    resolveEnsAvatars()
      .finally(() => {
        setLoading(false);
      })
      .catch(console.error);
  }, [page, users]);

  return (
    <div className="bg-denver min-h-screen">
      <div className="p-4 md:p-10 mx-auto max-w-4xl">
        <div className="mb-10">
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
        </div>
        <div className="leaderboard">
          <Title className="mb-3">Leaderboard</Title>
          {items.map((t, index) => (
            <div className="list-fix" key={t.userWallet + index}>
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
        </div>
      </div>
      <div style={authenticated ? { display: 'none' } : {}} id="render-privy" />
    </div>
  );
}
