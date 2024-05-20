import { ethers } from 'ethers';
import UniversalProfileContract from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json';
import { SiweMessage } from 'siwe';
import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js';
import profileSchema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json';

export async function connectLukso() {
  // @ts-ignore
  const provider = new ethers.BrowserProvider(window.lukso);
  const accounts = await provider.send('eth_requestAccounts', []);
  const siweMessage = new SiweMessage({
    domain: window.location.host,
    address: accounts[0],
    statement: 'By logging in you agree to the terms and conditions.',
    uri: window.location.origin,
    version: '1',
    chainId: 42,
    resources: ['https://terms.website.com']
  }).prepareMessage();
  const signer = await provider.getSigner(accounts[0]);

  const signature = await signer.signMessage(siweMessage);

  const universalProfileContract = new ethers.Contract(
    accounts[0],
    UniversalProfileContract.abi,
    provider
  );

  const hashedMessage = ethers.hashMessage(siweMessage);
  const isValidSignature = await universalProfileContract.isValidSignature(
    hashedMessage,
    signature
  );

  if (isValidSignature === '0x1626ba7e') {
    return { signature, account: accounts[0], signer };
  } else {
    throw new Error('Log In failed');
  }
}

export async function readLuksoProfile(address: string) {
  const erc725js = new ERC725(
    profileSchema as ERC725JSONSchema[],
    address,
    'https://42.rpc.thirdweb.com',
    {
      ipfsGateway: 'https://api.universalprofile.cloud/ipfs'
    }
  );
  const decodedProfileMetadata = await erc725js.fetchData(['LSP3Profile']);

  return decodedProfileMetadata;
}
