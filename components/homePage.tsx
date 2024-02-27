import { Card, Title, Subtitle, Text } from '@tremor/react';
import { useEffect, useRef, useState } from 'react';
import { MoonLoader } from 'react-spinners';
import ArrowUpRightIconWithGradient from './icons/social/arrowTopRight';
<<<<<<< HEAD
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit
} from 'firebase/firestore/lite';
import { db } from '../lib/firebase';
import { publicClient } from '../lib/utils';
=======
>>>>>>> d325748 (css updates)

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

<<<<<<< HEAD
=======
const sampleData = [
  {
    points: 100,
    ensName: 'john_doe.eth',
    id: 'abc123'
  },
  { points: 75, ensName: 'alice_smith.eth', id: 'def456' },
  { points: 120, ensName: 'crypto_wizard.eth', id: 'ghi789' },
  { points: 90, ensName: 'blockchain_guru.eth', id: 'jkl012' },
  { points: 60, ensName: 'ethereum_fanatic.eth', id: 'mno345' },
  { points: 85, ensName: 'decentralized_geek.eth', id: 'pqr678' },
  { points: 110, ensName: 'smart_contract_pro.eth', id: 'stu901' },
  { points: 95, ensName: 'crypto_enthusiast.eth', id: 'vwx234' },
  { points: 80, ensName: 'eth_hodler.eth', id: 'yz012' },
  { points: 70, ensName: 'web3_ninja.eth', id: 'abc345' },
  { points: 105, ensName: 'blockchain_nomad.eth', id: 'def678' },
  { points: 88, ensName: 'eth_explorer.eth', id: 'ghi901' },
  { points: 115, ensName: 'crypto_pioneer.eth', id: 'jkl234' },
  { points: 82, ensName: 'smart_contract_ninja.eth', id: 'mno567' },
  { points: 93, ensName: 'decentralized_master.eth', id: 'pqr890' },
  { points: 98, ensName: 'ethereum_visionary.eth', id: 'stu123' },
  { points: 76, ensName: 'web3_innovator.eth', id: 'vwx456' },
  { points: 102, ensName: 'eth_advocate.eth', id: 'yz789' },
  { points: 68, ensName: 'crypto_enthusiast.eth', id: 'abc012' },
  { points: 89, ensName: 'blockchain_enthusiast.eth', id: 'def345' }
];
const sampleQuestsData = [
  {
    Company: 'ABC Corp',
    Image: 'https://picsum.photos/80/80?random=1',
    Description: 'Innovative solutions',
    Points: 120,
    UsersCompleted: 1023
  },
  {
    Company: 'XYZ Ltd',
    Image: 'https://picsum.photos/80/80?random=2',
    Description: 'Tech solutions',
    Points: 90,
    UsersCompleted: 850
  },
  {
    Company: 'LMN Inc',
    Image: 'https://picsum.photos/80/80?random=3',
    Description: 'Global services',
    Points: 150,
    UsersCompleted: 1200
  },
  {
    Company: 'PQR Co',
    Image: 'https://picsum.photos/80/80?random=4',
    Description: 'Innovation hub',
    Points: 110,
    UsersCompleted: 950
  },
  {
    Company: 'EFG Corp',
    Image: 'https://picsum.photos/80/80?random=5',
    Description: 'Cutting-edge tech',
    Points: 135,
    UsersCompleted: 1100
  },
  {
    Company: 'JKL Ltd',
    Image: 'https://picsum.photos/80/80?random=6',
    Description: 'Strategic solutions',
    Points: 100,
    UsersCompleted: 900
  },
  {
    Company: 'RST Inc',
    Image: 'https://picsum.photos/80/80?random=7',
    Description: 'Innovate & grow',
    Points: 125,
    UsersCompleted: 1050
  },
  {
    Company: 'MNO Co',
    Image: 'https://picsum.photos/80/80?random=8',
    Description: 'Quality services',
    Points: 140,
    UsersCompleted: 1150
  }
];
>>>>>>> d325748 (css updates)
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
<<<<<<< HEAD
    <div className="bg-denver min-h-screen">
=======
    <div className="bg-denver">
>>>>>>> d325748 (css updates)
      <div className="p-4 md:p-10 mx-auto max-w-4xl">
        <div className="mb-10">
          <Title>Quests</Title>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,1fr))] gap-y-2 gap-x-2 mt-2.5 grid-auto-rows-minmax mr-auto ml-auto">
<<<<<<< HEAD
            {quests.map((t) => (
              <Card
                key={t.name}
=======
            {sampleQuestsData.map((t) => (
              <Card
                key={t.Company}
>>>>>>> d325748 (css updates)
                className="flex flex-col quest-card bg-white justify-between"
              >
                <div className="mt-1 mb-5 flex items-center flex-row">
                  <img
<<<<<<< HEAD
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
=======
                    src={t.Image}
                    width={20}
                    height={20}
                    alt=""
                    className="rounded-2xl mr-2"
                  />
                  <p className="">{t.Company}</p>
                </div>
                <Subtitle className="mb-5">{t.Description}</Subtitle>
                <div className="flex flex-row justify-between items-center">
                  <p>+5 points</p>
>>>>>>> d325748 (css updates)
                  <ArrowUpRightIconWithGradient />
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div className="leaderboard">
          <Title className="mb-3">Leaderboard</Title>

          {items.map((t, index) => (
            <div className="list-fix" key={t.userWallet}>
              <div className="number-col">#{index + 1}</div>
              <div className="list-body pl-4 pr-4">
                <div className="flex flex-row items-center">
<<<<<<< HEAD
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
=======
                  <img
                    className="rounded-full mr-2 grayscale"
                    width="30"
                    height="30"
                    src="https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2Fleerob.png?alt=media&token=eedc1fc0-65dc-4e6e-a546-ad3840afa293"
                    alt="logo"
                  />
                  <div className="list-wrap">{t.ensName}</div>
>>>>>>> d325748 (css updates)
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
    </div>
  );
}
