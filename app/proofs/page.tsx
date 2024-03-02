'use client';
import { Title } from '@tremor/react';
import { useEffect, useRef, useState } from 'react';
import { MoonLoader } from 'react-spinners';
import ArrowUpRightIconWithGradient from './../../components/icons/social/arrowTopRight';
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  startAfter,
  where,
  or
} from 'firebase/firestore/lite';
import { db } from './../../lib/firebase';
import { publicClient } from './../../lib/utils';

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

export default function Proofs() {
  const [items, setItems] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const loaderRef = useRef(null);
  const proofsRef = useRef(collection(db, 'Proof'));

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

      const queryParams = [
        proofsRef.current,
        orderBy('timestamp', 'desc'),
        where('timestamp', '!=', 0),
        where('image', '==', true)
        // orderBy('ipfsImageURL', 'desc'),
      ] as any[];

      if (page > 1) {
        queryParams.push(startAfter(items.slice(-1)[0].timestamp));
        queryParams.push(limit(10));
      } else {
        queryParams.push(limit(10));
      }
      //  @ts-ignore
      const q = query(...queryParams);

      getDocs(q).then(async (snapshot) => {
        const tempArray: Attestation[] = [];
        snapshot.forEach(async (s) => {
          try {
            const tempData = s.data() as Attestation;
            tempArray.push(tempData);
          } catch (error) {
            console.log(error);
          }
        });
        setItems((t) => [...t, ...tempArray]);
        // const items = await Promise.allSettled(
        //   [...tempArray].map(async (t) => {
        //     const tempObj = { ...t };
        //     const ensName = await publicClient.getEnsName({
        //       address: `${t.userWallet}` as any
        //     });
        //     if (ensName) {
        //       return { ...tempObj, ensName };
        //     }
        //     return tempObj;
        //   })
        // );
        // const filteredItems = items.filter(
        //   (d) => d.status === 'fulfilled'
        // ) as any;
        // setItems((t) => [...t, ...filteredItems.map((d: any) => d.value)]);
      });
    };
    resolveEnsAvatars()
      .finally(() => {
        setLoading(false);
      })
      .catch(console.timeLog);
  }, [page]);
  return (
    <div className="bg-denver min-h-screen">
      <div className="p-4 md:p-10 mx-auto max-w-4xl">
        <div className="leaderboard">
          <Title className="mb-3">Proofs</Title>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,1fr))] gap-y-1 gap-x-1 mt-2.5 grid-auto-rows-minmax mr-auto ml-auto">
            {[...items]
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((t) => (
                <button
                  key={t.timestamp}
                  className="p-0 overflow-hidden card-flip"
                  style={{ borderWidth: 0, borderRadius: '0px' }}
                >
                  <div className="card-inner flex flex-col grid-card cursor-pointer justify-end ">
                    <div className="card-front">
                      <img
                        src={t.ipfsImageURL}
                        alt=""
                        className="front-image"
                      />
                    </div>
                    <button className="card-back bg-white p-2 flex flex-col space-between">
                      <div className="mt-1 mb-1 flex items-center flex-row">
                        <img
                          src={t.ipfsImageURL}
                          width={20}
                          height={20}
                          alt=""
                          className="rounded-full mr-2 object-cover w-[20px] h-[20px]"
                        />
                        <p className="uppercase">{t.questId}</p>
                      </div>
                      <p className="mb-1 text-gray-700 font-light mt-2">
                        {t.postContent}
                      </p>
                      <div className="flex flex-row justify-between items-center mt-auto">
                        <p>+{t.pointValue} points</p>
                        <a
                          href={`https://www.onceupon.gg/${t.transaction}`}
                          target="_blank"
                        >
                          <ArrowUpRightIconWithGradient />
                        </a>
                      </div>
                    </button>
                  </div>
                </button>
              ))}
          </div>

          <div
            ref={loaderRef}
            className="bg-transparent min-h-12  mt-5 h-12 flex flex-row justify-center"
          >
            {loading ? (
              <MoonLoader size={100} color="rgba(255,255,255,.9)" />
            ) : null}
          </div>
        </div>{' '}
      </div>
    </div>
  );
}
