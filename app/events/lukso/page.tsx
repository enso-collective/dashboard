'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, Subtitle, Title } from '@tremor/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { usePrivy, useWallets, WalletWithMetadata } from '@privy-io/react-auth';
import { redirect } from 'next/navigation';
import { connectLukso, readLuksoProfile } from '../../../lib/lukso';
import { LuksoConnector } from '../../../components/auth-linker';
import {
  query,
  or,
  where,
  getDocs,
  collection,
  limit,
  updateDoc,
  doc
} from 'firebase/firestore/lite';
import { db } from '../../../lib/firebase';

export default function Lukso() {
  const [expandQuests, setExpandQuests] = useState(true);
  const [expandLeaderboard, setExpandLeaderboard] = useState(true);
  const [expandGallery, setExpandGallery] = useState(true);
  const { authenticated, ready, user } = usePrivy();
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
      const addressTrimmedToLowerCase = wallets[0].address.toLowerCase().trim();
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

  // const [luksoProfile, setLuksoProfile] = useState<any>();

  // useEffect(() => {
  //   if (luksoAddress) {

  //     readLuksoProfile(luksoAddress).then(setLuksoProfile);
  //   }
  // }, [luksoAddress, setLuksoProfile]);

  useEffect(() => {
    if (!authenticated && ready) {
      redirect('/');
    }
  }, [ready, authenticated]);

  return (
    <div className="bg-denver min-h-screen">
      <div className="p-4 md:p-10 mx-auto max-w-4xl">
        <LuksoConnector
          icon={
            <img
              src="https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2Flukso.png?alt=media&token=c455efa6-2865-4ec6-b1d5-0492b9e4a66d"
              height={18}
              width={18}
            />
          }
          isActive={Boolean(luksoAddress)}
          label={luksoAddress ? 'Connected' : 'Connect'}
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

        <button
          className="mb-5 mt-5 frosty p-2 rounded-sm flex justify-between items-center w-[100%]"
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
      </div>
    </div>
  );
}
