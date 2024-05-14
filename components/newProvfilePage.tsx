import { Card, Title, Subtitle, Text } from '@tremor/react';
import { useEffect, useRef, useState } from 'react';
import { MoonLoader } from 'react-spinners';
import ArrowUpRightIconWithGradient from './icons/social/arrowTopRight';
import { db } from '../lib/firebase';
import { usePrivy, useWallets, WalletWithMetadata } from '@privy-io/react-auth';
import { usePrivyContext } from './privyProvider';
import { query, or, where, getDocs, collection } from 'firebase/firestore/lite';
import GiganticLoader from './giganticLoader';
import GallryImageCard from './galleryImageCard';
import ProfilePage from './profilePage';

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
    const linkedAccounts = user?.linkedAccounts || [];

    const wallets: WalletWithMetadata[] = Object.assign(
      [],
      linkedAccounts.filter((a: any) => a.type === 'wallet')
    ).sort((a: WalletWithMetadata, b: WalletWithMetadata) =>
      a.verifiedAt.toLocaleString().localeCompare(b.verifiedAt.toLocaleString())
    ) as WalletWithMetadata[];
    if (wallets.length > 0) {
      const addressTrimmedToLowerCase = wallets[0].address.toLowerCase().trim();
      console.log({ addressTrimmedToLowerCase });
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
  }, [user?.linkedAccounts]);

  return (
    <div className="bg-denver min-h-screen">
      {loading ? (
        <GiganticLoader />
      ) : (
        <div className="p-4 md:p-10 mx-auto max-w-4xl">
          <ProfilePage />
          <div className="mb-10">
            <button className=" frosty p-2 rounded-sm flex justify-between items-center w-[100%] mt-10">
              <Title className="">Attestations</Title>
            </button>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,1fr))] gap-y-1 gap-x-1 mt-2.5 grid-auto-rows-minmax mr-auto ml-auto">
              {gallery.map((t) => (
                <GallryImageCard t={t} key={t.timestamp} />
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
                      <p className="font-medium">+{t.pointValue} points</p>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 grow-0 flex-row items-center justify-end gap-x-1">
                  <a
                    href={`https://www.onceupon.gg/${t.transaction}`}
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
