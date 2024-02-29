import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  where,
  or,
  updateDoc,
  setDoc
} from 'firebase/firestore/lite';
import { db } from './firebase';
import { WalletWithMetadata } from '@privy-io/react-auth';

export async function prviyLoginCallback(user: any) {
  if (user?.wallet?.address) {
    const linkedAccounts = user?.linkedAccounts || [];
    const wallets: WalletWithMetadata[] = Object.assign(
      [],
      linkedAccounts.filter((a: any) => a.type === 'wallet')
    ).sort((a: WalletWithMetadata, b: WalletWithMetadata) =>
      a.verifiedAt.toLocaleString().localeCompare(b.verifiedAt.toLocaleString())
    ) as WalletWithMetadata[];
    const addressTrimmedToLowerCase = wallets[0].address.toLowerCase().trim();
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
          mainWallet: addressTrimmedToLowerCase
        } as any;
        if (user?.twitter?.username) {
          payload.twitterUsername = user?.twitter?.username;
        }
        try {
          if (snapshot.empty) {
            const docRef = doc(db, 'User', user.id);

            await setDoc(docRef, {
              ...payload,
              userWallet: addressTrimmedToLowerCase,
              userWalletLower: addressTrimmedToLowerCase,
              points: 0,
              proofs: [],
              attestationUID: []
            });
          } else {
            snapshot.forEach(async (s) => {
              try {
                const docRef = doc(db, 'User', s.id);
                await updateDoc(docRef, { ...payload });
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
  }
}
