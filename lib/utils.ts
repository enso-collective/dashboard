import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { db } from './firebase'; // Import your Firestore instance

export const getHumanReadableWalletType = (
  walletType:
    | 'metamask'
    | 'coinbase_wallet'
    | 'wallet_connect'
    | 'phantom'
    | 'embedded'
    | 'capsule'
    | undefined
) => {
  switch (walletType) {
    case 'metamask':
      return 'MetaMask';
    case 'coinbase_wallet':
      return 'Coinbase Wallet';
    case 'wallet_connect':
      return 'WalletConnect';
    case 'phantom':
      return 'Phantom';
    case 'capsule':
      return 'Capsule'; //not working? more setup to do?
    case 'embedded':
      return 'Privy';
    default:
      return 'Unknown Wallet';
  }
};

export const formatWallet = (address: string | undefined): string => {
  if (!address) {
    return '';
  }
  const first = address.slice(0, 5);
  const last = address.slice(address.length - 3, address.length);
  return `${first}...${last}`;
};

export const isEmpty = (value: any) => {
  return (
    value == null || (typeof value === 'string' && value.trim().length === 0)
  );
};

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
});

// export const addTwitterAccountToWallet = (userWallet: string, twitterUsername: string): Promise<void> => {
//   return db.collection('users').where('wallet', '==', userWallet).get().then((querySnapshot) => {
//     const updates = querySnapshot.docs.map((doc) => {
//       return doc.ref.set({
//         twitterUsername: twitterUsername
//       }, { merge: true });
//     });

//     return Promise.all(updates);
//   });
// };

export function* chunker(vals: Array<any>, chunk: number) {
  for (let x = 0; x < vals.length; x += chunk) {
    yield vals.slice(x, x + chunk);
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
