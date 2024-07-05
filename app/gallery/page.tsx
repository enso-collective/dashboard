'use client';
import { Title } from '@tremor/react';
import { useEffect, useRef, useState } from 'react';
import { MoonLoader } from 'react-spinners';
import {
  collection,
  getDocs,
  orderBy,
  query,
  where
} from 'firebase/firestore/lite';
import { db } from '../../lib/firebase';
import GallryImageCard from '../../components/galleryImageCard';

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
  const proofsRef = useRef(collection(db, 'Proof'));

  useEffect(() => {
    const resolveEnsAvatars = async () => {
      const queryParams = [
        proofsRef.current,
        orderBy('timestamp', 'desc'),
        where('timestamp', '!=', 0),
        where('ipfsImageURL', '>', ''),
        where('image', '==', true)
      ] as any[];
      //  @ts-ignore
      const q = query(...queryParams);
      const tempArray: Attestation[] = [];
      const snapshot = await getDocs(q);

      snapshot.forEach((s) => {
        const tempData = s.data() as Attestation;

        tempArray.push(tempData);
      });
      setItems((t) => [...t, ...tempArray]);
    };

    resolveEnsAvatars()
      .catch(console.log)
      .finally(() => {
        setLoading(false);
      });
  }, []);
  return (
    <div className="bg-denver min-h-screen">
      <div className="p-4 md:p-10 mx-auto max-w-4xl">
        <div className="leaderboard">
          <Title className="mb-3">Proofs</Title>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,1fr))] gap-y-1 gap-x-1 mt-2.5 grid-auto-rows-minmax mr-auto ml-auto">
            {items.map((t) => (
              <GallryImageCard t={t} key={t.timestamp} />
            ))}
          </div>

          <div className="bg-transparent min-h-12  mt-5 h-12 flex flex-row justify-center">
            {loading ? <MoonLoader size={100} color="rgba(0,0,0,.9)" /> : null}
          </div>
        </div>{' '}
      </div>
    </div>
  );
}
