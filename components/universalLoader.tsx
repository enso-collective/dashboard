'use client';
import { usePrivy, WalletWithMetadata } from '@privy-io/react-auth';
import { useEffect } from 'react';
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  where,
  or,
  updateDoc,
  setDoc,
  getDoc
} from 'firebase/firestore/lite';
import { db } from './../lib/firebase';

export default function UniversalLoader() {
  const { ready, authenticated, createWallet, user } = usePrivy();
  useEffect(() => {
    try {
      if (ready && authenticated && user) {
        if (
          user?.linkedAccounts &&
          Array.isArray(user?.linkedAccounts) &&
          user.linkedAccounts.length > 0
        ) {
          const linkedAccounts = user?.linkedAccounts;
          const wallets: WalletWithMetadata[] = Object.assign(
            [],
            linkedAccounts.filter((a: any) => a.type === 'wallet')
          ).sort((a: WalletWithMetadata, b: WalletWithMetadata) =>
            a.verifiedAt
              .toLocaleString()
              .localeCompare(b.verifiedAt.toLocaleString())
          ) as WalletWithMetadata[];
          if (wallets[0]?.address) {
            const addressTrimmedToLowerCase = wallets[0]?.address
              .toLowerCase()
              .trim();
            console.log({ addressTrimmedToLowerCase });
            const q = query(
              collection(db, 'User'),
              or(
                where('userWallet', '==', addressTrimmedToLowerCase),
                where('userWalletToLowerCase', '==', addressTrimmedToLowerCase),
                where('userWalletLower', '==', addressTrimmedToLowerCase)
              ),
              limit(1)
            );
            getDocs(q)
              .then(async (snapshot) => {
                const payload = {
                  privyId: user.id,
                  mainWallet: addressTrimmedToLowerCase,
                  userWalletToLowerCase: addressTrimmedToLowerCase
                } as any;
                if (user?.twitter?.username) {
                  payload.twitterUsername = user?.twitter?.username;
                }
                try {
                  if (snapshot.empty) {
                    const docRef = doc(db, 'User', user.id);
                    const tempDoc = {
                      ...payload,
                      userWallet: addressTrimmedToLowerCase,
                      userWalletLower: addressTrimmedToLowerCase,
                      points: 0,
                      proofs: [],
                      attestationUID: []
                    };
                    if (payload.twitterUsername) {
                      tempDoc.shefiVersion = 2;
                      tempDoc.shefiPoints = 5;
                    }
                    await setDoc(docRef, { ...tempDoc });
                  } else {
                    snapshot.forEach(async (s) => {
                      try {
                        const docRef = doc(db, 'User', s.id);
                        const docSnap = await getDoc(docRef);
                        const oldDoc: any = docSnap.data();
                        const tempDoc = { ...payload };
                        if (
                          payload.twitterUsername &&
                          oldDoc?.shefiVersion !== 2
                        ) {
                          tempDoc.shefiVersion = 2;
                          tempDoc.shefiPoints =
                            Number(oldDoc?.shefiPoints || 0) + 5;
                        }
                        await updateDoc(docRef, { ...tempDoc });
                      } catch (error) {
                        console.log(error);
                      }
                    });
                  }
                } catch (error) {
                  console.log(error);
                }
              })
              .catch(console.log);
          } else {
            console.log('everything is not ready here');
            createWallet().then(console.log).catch(console.log);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, [ready, authenticated, createWallet, user]);
  return <></>;
}
