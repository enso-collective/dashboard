import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

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
