import { Card, Title, Subtitle, Text } from '@tremor/react';
import { useEffect, useRef, useState } from 'react';
import { MoonLoader } from 'react-spinners';
import ArrowUpRightIconWithGradient from './icons/social/arrowTopRight';
import { db } from '../lib/firebase';
import { usePrivy, useWallets, WalletWithMetadata } from '@privy-io/react-auth';
import { usePrivyContext } from './privyProvider';
import { query, or, where, getDocs, collection } from 'firebase/firestore/lite';
import GiganticLoader from './giganticLoader';

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
}

export default function NewProfilePage() {
  const loaderRef = useRef(null);
  const { authenticated, user } = usePrivy();
  const [activeWallet, setActiveWallet] = useState<WalletWithMetadata | null>(
    null
  );
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [gallery, setGallery] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(true);

  const { wallets: connectedWallets } = useWallets();
  const linkedAccounts = user?.linkedAccounts || [];
  const wallets = linkedAccounts.filter(
    (a) => a.type === 'wallet'
  ) as WalletWithMetadata[];

  const linkedAndConnectedWallets = wallets
    .filter((w) => connectedWallets.some((cw) => cw.address === w.address))
    .sort((a, b) =>
      b.verifiedAt.toLocaleString().localeCompare(a.verifiedAt.toLocaleString())
    );

  useEffect(() => {
    // if no active wallet is set, set it to the first one if available
    if (!activeWallet && linkedAndConnectedWallets.length > 0) {
      setActiveWallet(linkedAndConnectedWallets[0]!);
    }
    // if an active wallet was removed from wallets, clear it out
    if (
      !linkedAndConnectedWallets.some(
        (w) => w.address === activeWallet?.address
      )
    ) {
      setActiveWallet(
        linkedAndConnectedWallets.length > 0
          ? linkedAndConnectedWallets[0]!
          : null
      );
    }
  }, [activeWallet, linkedAndConnectedWallets]);

  useEffect(() => {
    if (activeWallet) {
      const addressTrimmedToLowerCase = activeWallet.address
        .toLowerCase()
        .trim();
      const q = query(
        collection(db, 'Proof'),
        or(
          where('userWallet', '==', addressTrimmedToLowerCase),
          where('userWalletToLowerCase', '==', addressTrimmedToLowerCase),
          where('userWalletLower', '==', addressTrimmedToLowerCase)
        )
      );
      getDocs(q)
        .then((snapshot) => {
          const tempArray: Attestation[] = [];
          snapshot.forEach(async (s) => {
            try {
              tempArray.push(s.data() as Attestation);
            } catch (error) {
              console.log(error);
            }
          });
          setAttestations(tempArray.filter((t) => !t.image));
          setGallery(tempArray.filter((t) => t.image));
          setLoading(false);
        })
        .catch(console.log);
    }
  }, [activeWallet]);

  return (
    <div className="bg-denver min-h-screen">
      {loading ? (
        <GiganticLoader />
      ) : (
        <div className="p-4 md:p-10 mx-auto max-w-4xl">
          <div className="mb-10">
            <Title className="mb-3">Attestations</Title>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,1fr))] gap-y-1 gap-x-1 mt-2.5 grid-auto-rows-minmax mr-auto ml-auto">
              {gallery.map((t) => (
                <div
                  key={t.timestamp}
                  className="p-0 overflow-hidden"
                  style={{ borderWidth: 0, borderRadius: '0px' }}
                >
                  <div className="card-inner flex flex-col grid-card cursor-pointer justify-end ">
                    <img src={t.ipfsImageURL} alt="" className="front-image" />
                    <div className="card-back bg-white p-2 flex flex-col space-between">
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
                          href={`https://basescan.org/tx/${t.transaction}`}
                          target="_blank"
                        >
                          <ArrowUpRightIconWithGradient />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="non-image-section">
            {attestations.map((t) => (
              <div
                key={t.timestamp}
                className={`non-image-list-item resize-mobile group mt-3 flex min-h-10 min-w-full items-center justify-between gap-x-3 rounded-md border  px-3 text-sm border-privy-color-foreground-4 py-2`}
              >
                <div className="flex 1 grow-0 items-center gap-x-2">
                  <div className="w-full">
                    <p className="font-medium">{t.poapName}</p>
                    <div className="flex items-center ">
                      <p className="font-light mr-2 text-gray-700">
                        {new Intl.DateTimeFormat('en-US', {
                          minute: '2-digit',
                          hour12: true,
                          hour: '2-digit',
                          day: '2-digit',
                          year: 'numeric',
                          month: 'short'
                          // dateStyle: 'medium'
                        }).format(new Date(t.timestamp))}{' '}
                        {t.image}
                      </p>
                      <p className="font-medium">+{t.pointValue} points</p>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 grow-0 flex-row items-center justify-end gap-x-1">
                  <a
                    href={`https://basescan.org/tx/${t.transaction}`}
                    target="_blank"
                  >
                    <ArrowUpRightIconWithGradient />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
