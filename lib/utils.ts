import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { db } from './firebase'; // Import your Firestore instance
import { AlchemyProvider } from 'ethers';

const provider = new AlchemyProvider(
  'homestead',
  'Nt6dkIkJSB7Rg_R4CALhittnICXXnzeE'
);

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

export async function getEnsName(address: string): Promise<string | null> {
  try {
    const name = await provider.lookupAddress(address);
    return name;
  } catch (error) {
    console.error(`Error fetching ENS name for ${address}:`);
    return null;
  }
}

export async function getAvatar(name: string): Promise<string | null> {
  try {
    const avatar = await provider.getAvatar(`${name}`);
    return avatar;
  } catch (error) {
    console.error(`Error fetching avatar for ${address}:`);
    return null;
  }
}

// Usage
const address = '0x123...'; // Replace with the Ethereum address

(async () => {
  const ensName = await getEnsName(address);
  console.log(`ENS Name: ${ensName}`);

  const avatar = await getAvatar(address);
  console.log(`Avatar: ${avatar}`);
})();
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
