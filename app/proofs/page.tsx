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
  startAfter
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
        orderBy('timestamp', 'desc')
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
        // setItems((t) => [...t, ...tempArray]);
        const items = await Promise.allSettled(
          [...tempArray].map(async (t) => {
            const tempObj = { ...t };
            const ensName = await publicClient.getEnsName({
              address: `${t.userWallet}` as any
            });
            if (ensName) {
              return { ...tempObj, ensName };
            }
            return tempObj;
          })
        );
        const filteredItems = items.filter(
          (d) => d.status === 'fulfilled'
        ) as any;
        setItems((t) => [...t, ...filteredItems.map((d: any) => d.value)]);
      });
    };
    resolveEnsAvatars()
      .finally(() => {
        setLoading(false);
      })
      .catch(console.error);
  }, [page]);
  return (
    <div className="bg-denver min-h-screen">
      <div className="p-4 md:p-10 mx-auto max-w-4xl">
        <div className="leaderboard">
          <Title className="mb-3">Proofs</Title>
          {items.map((t, index) => (
            <div className="list-fix" key={t.userWallet}>
              <div className="number-col">#{index + 1}</div>
              <div className="list-body pl-4 pr-4">
                <div className="flex flex-row items-center">
                  <div className="list-wrap">
                    {t.postContent || t.poapName || t.quest}
                    <p className="font-light mr-2 text-gray-700 text-xs">
                      {t.ensName || t.userWallet}
                    </p>
                    <p className="font-light mr-2 text-gray-700 text-sm">
                      {t.timestamp
                        ? new Intl.DateTimeFormat('en-US', {
                            minute: '2-digit',
                            hour12: true,
                            hour: '2-digit',
                            day: '2-digit',
                            year: 'numeric',
                            month: 'short'
                            // dateStyle: 'medium'
                          }).format(new Date(t.timestamp))
                        : ''}{' '}
                    </p>
                  </div>
                </div>

                <a
                  className="flex-shrink-0 text-right"
                  href={`https://basescan.org/tx/${t.transaction}`}
                  target="_blank"
                >
                  <ArrowUpRightIconWithGradient />
                </a>
              </div>
            </div>
          ))}

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
