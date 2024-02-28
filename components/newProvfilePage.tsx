import { Card, Title, Subtitle, Text } from '@tremor/react';
import { useEffect, useRef, useState } from 'react';
import { MoonLoader } from 'react-spinners';
import ArrowUpRightIconWithGradient from './icons/social/arrowTopRight';
import { db } from '../lib/firebase';
import { usePrivy, useWallets, WalletWithMetadata } from '@privy-io/react-auth';
import { usePrivyContext } from './privyProvider';

const sampleQuestsData = [
  {
    Company: 'ABC Corp',
    Image: 'https://picsum.photos/80/80?random=1',
    Description: 'Innovative solutions',
    Points: 120,
    UsersCompleted: 1023
  },
  {
    Company: 'XYZ Ltd',
    Image: 'https://picsum.photos/80/80?random=2',
    Description: 'Tech solutions',
    Points: 90,
    UsersCompleted: 850
  },
  {
    Company: 'LMN Inc',
    Image: 'https://picsum.photos/80/80?random=3',
    Description: 'Global services',
    Points: 150,
    UsersCompleted: 1200
  },
  {
    Company: 'PQR Co',
    Image: 'https://picsum.photos/80/80?random=4',
    Description: 'Innovation hub',
    Points: 110,
    UsersCompleted: 950
  },
  {
    Company: 'EFG Corp',
    Image: 'https://picsum.photos/80/80?random=5',
    Description: 'Cutting-edge tech',
    Points: 135,
    UsersCompleted: 1100
  },
  {
    Company: 'JKL Ltd',
    Image: 'https://picsum.photos/80/80?random=6',
    Description: 'Strategic solutions',
    Points: 100,
    UsersCompleted: 900
  },
  {
    Company: 'RST Inc',
    Image: 'https://picsum.photos/80/80?random=7',
    Description: 'Innovate & grow',
    Points: 125,
    UsersCompleted: 1050
  },
  {
    Company: 'MNO Co',
    Image: 'https://picsum.photos/80/80?random=8',
    Description: 'Quality services',
    Points: 140,
    UsersCompleted: 1150
  }
];
export default function NewProfilePage() {
  const loaderRef = useRef(null);
  const { authenticated, user } = usePrivy();
  const [activeWallet, setActiveWallet] = useState<WalletWithMetadata | null>(
    null
  );
  const [attestations, setAttestations] = useState([]);

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

  useEffect(() => {}, [activeWallet]);

  return (
    <div className="bg-denver">
      <div className="p-4 md:p-10 mx-auto max-w-4xl">
        <div className="mb-10">
          <Title>Gallery</Title>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,1fr))] gap-y-1 gap-x-1 mt-2.5 grid-auto-rows-minmax mr-auto ml-auto">
            {sampleQuestsData.map((t) => (
              <div
                key={t.Company}
                className="p-0 overflow-hidden"
                style={{ borderWidth: 0, borderRadius: '0px' }}
              >
                <div className="card-inner flex flex-col grid-card cursor-pointer justify-end ">
                  <img src={t.Image} alt="" className="front-image" />
                  <div className="card-back bg-white p-2 ">
                    <div className="mt-1 mb-1 flex items-center flex-row">
                      <img
                        src={t.Image}
                        width={20}
                        height={20}
                        alt=""
                        className="rounded-2xl mr-2"
                      />
                      <p className="">{t.Company}</p>
                    </div>
                    <p className="mb-1 text-gray-700 font-light">
                      {t.Description}
                    </p>
                    <div className="flex flex-row justify-between items-center">
                      <p>+5 points</p>
                      <ArrowUpRightIconWithGradient />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="non-image-section">
          <Title className="mb-3">List View</Title>
          {sampleQuestsData.map((t) => (
            <div
              key={t.Company}
              className={`non-image-list-item resize-mobile group mt-3 flex min-h-10 min-w-full items-center justify-between gap-x-3 rounded-md border  px-3 text-sm border-privy-color-foreground-4 py-2`}
            >
              <div className="flex 1 grow-0 items-center gap-x-2">
                <div className="w-full">
                  <p className="font-medium">{t.Company}</p>
                  <div className="flex items-center ">
                    <p className="font-light mr-2 text-gray-700">
                      {t.Description}
                    </p>
                    <p className="font-medium">+{t.Points} points</p>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 grow-0 flex-row items-center justify-end gap-x-1">
                <a href={''} target="_blank">
                  <ArrowUpRightIconWithGradient />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
