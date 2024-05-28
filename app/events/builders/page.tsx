'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, Subtitle, Title } from '@tremor/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { usePrivy, useWallets, WalletWithMetadata } from '@privy-io/react-auth';
import { redirect } from 'next/navigation';
import { connectLukso, readLuksoProfile } from '../../../lib/lukso';
import {
  FarcasterConnectorMod2,
  LuksoConnectorMod2,
  TwitterConnectorMod2
} from '../../../components/auth-linker';
import {
  query,
  or,
  where,
  getDocs,
  collection,
  limit,
  updateDoc,
  doc,
  orderBy
} from 'firebase/firestore/lite';
import { db } from '../../../lib/firebase';
import TwitterXIcon from '../../../components/icons/social/twitter-x';
import ArrowUpRightIconWithGradient from '../../../components/icons/social/arrowTopRight';
import { Tooltip } from 'react-tooltip';
import { Attestation, User } from '../shefi/page';
import GallryImageCard from '../../../components/galleryImageCard';
import FarcasterIcon from '../../../components/icons/social/farcaster';
import { chunker, publicClient, sleep } from '../../../lib/utils';

const events: {
  title: string;
  subtitle: string;
  link: string;
  points: number;
}[] = [
  {
    title: 'Show Off The Builders DAO merch',
    subtitle:
      'Tweet / Cast a photo of The Builders DAO sticker or merch you collected or you found around the event in Lisbon',
    link: 'https://warpcast.com/~/compose?text=Shout-out%20to%20%40TheBuildersDAO%20for%20the%20coolest%20merch%20of%20%2FNFCsummit%20in%20Lisbon!%20%23ProofOfBuilders',
    points: 100
  },
  {
    title: 'Selfie with a builder',
    subtitle:
      'Tweet / Cast a selfie or a photo of a member of The Builders DAO team in Lisbon!',
    link: 'https://warpcast.com/~/compose?text=Hello%20everyone%20from%20%2FNFCsummit%20in%20Lisbon%20with%20%40TheBuildersDAO%20team!%20%23ProofOfBuilders',
    points: 200
  },
  {
    title: 'Animals side event',
    subtitle:
      'Tweet / Cast a photo of the art exhibition hosted by The Builders DAO and Nox Gallery in Lisbon!',
    link: 'https://warpcast.com/~/compose?text=We%20Love%20the%20Art%20at%20the%20Animals%20event%2C%20with%20%40TheBuildersDAO%20and%20%40NOXGallery%20in%20Lisbon.',
    points: 300
  }
];
interface ProofOfLUKSOEvent {
  title: string;
  subtitle: string;
  showModal: boolean;
  setShowModal: Function;
  link: string;
  points: number;
}
function LuksoQuest({
  title,
  subtitle,
  link,
  showModal,
  setShowModal,
  points
}: ProofOfLUKSOEvent) {
  const [showFull, setShowFull] = useState(false);
  const subtitleArray = subtitle.split(' ');
  const trim =
    subtitleArray.length > 15
      ? subtitleArray.slice(0, 15).join(' ') + '...'
      : subtitleArray.join(' ');
  const firstTrim = subtitleArray.slice(0, 15).join(' ');
  return (
    <Card className="flex flex-col quest-card bg-white ">
      <div className="mt-1 mb-5 flex items-center flex-row">
        <p className="font-medium">{title}</p>
      </div>
      <div className="mb-5  text-sm  text-gray-600">
        <span>{showFull ? subtitle : trim}</span> {showFull ? <br /> : null}
        {firstTrim.length !== subtitle.length ? (
          <span
            style={{ color: 'var(--privy-color-accent)' }}
            className="cursor-pointer"
            onClick={() => {
              setShowFull((t) => !t);
            }}
          >
            {showFull ? ' show less' : 'show more'}
          </span>
        ) : (
          <></>
        )}
      </div>
      <div className="flex flex-row justify-between items-center mt-[auto]">
        <p>+{points} points</p>
        <Tooltip id="lukso-tooltip" />
        {link.length > 0 ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            <ArrowUpRightIconWithGradient />
          </a>
        ) : (
          <a
            data-tooltip-id="lukso-tooltip"
            data-tooltip-content="Enabled at the side event"
            data-tooltip-place="top"
          >
            <ArrowUpRightIconWithGradient />
          </a>
        )}
      </div>
    </Card>
  );
}
export default function Lukso() {
  const [expandQuests, setExpandQuests] = useState(true);
  const [expandLeaderboard, setExpandLeaderboard] = useState(true);
  const [expandGallery, setExpandGallery] = useState(true);
  const {
    authenticated,
    ready,
    user,
    linkTwitter,
    unlinkTwitter,
    linkFarcaster,
    unlinkFarcaster
  } = usePrivy();
  const [primaryWallet, setPrimaryWallet] = useState<string | null>();
  const proofsRef = useRef(collection(db, 'Proof'));
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
  const usersRef = useRef(collection(db, 'User'));
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<User[]>([]);
  useEffect(() => {
    if (users.length > 0) {
      const resolveEnsAvatars = async () => {
        try {
          // @ts-ignore
          for (const chunk of chunker(users, 10)) {
            const items = await Promise.allSettled(
              [...chunk].map(async (t) => {
                const tempObj = { ...t };
                const ensName = await publicClient.getEnsName({
                  address: `${t.userWallet}` as any
                });
                if (ensName) {
                  const ensAvatar = await publicClient.getEnsAvatar({
                    name: ensName
                  });
                  if (ensAvatar) {
                    return { ...tempObj, image: ensAvatar, ensName };
                  }
                  return { ...tempObj, ensName };
                }
                return tempObj;
              })
            );
            const filteredItems = items.filter(
              (d) => d.status === 'fulfilled'
            ) as any;
            setItems((t) => [...t, ...filteredItems.map((d: any) => d.value)]);
            await sleep(5000);
          }
        } catch (error) {
          console.log(error);
        } finally {
        }
      };
      resolveEnsAvatars()
        .finally(() => {})
        .catch(console.error);
    }
  }, [users]);

  useEffect(() => {
    getDocs(
      query(usersRef.current, orderBy('buildersPoints', 'desc'), limit(100))
    )
      .then((snapshot) => {
        const tempArr: User[] = [];
        snapshot.forEach((d) => tempArr.push(d.data() as User));
        setUsers(tempArr);
      })
      .catch(console.log);
  }, [setUsers]);

  //   useEffect(() => {
  //     getDocs(
  //       query(
  //         usersRef.current,
  //         orderBy('pointValueLukso', 'desc'),
  //         where('luksoAddress', '>', ''),
  //         limit(100)
  //       )
  //     )
  //       .then((snapshot) => {
  //         const tempArr: any[] = [];
  //         snapshot.forEach((d) => tempArr.push(d.data() as any));
  //         setUsers(tempArr);
  //       })
  //       .catch(console.log);
  //   }, [setUsers]);

  const farcasterSubject = user?.farcaster?.fid;
  const farcasterName = user?.farcaster?.username;

  const [attestations, setAttestations] = useState<Attestation[]>([]);

  //   useEffect(() => {
  //     const resolveEnsAvatars = async () => {
  //       const queryParams = [
  //         proofsRef.current,
  //         orderBy('timestamp', 'desc'),
  //         where('timestamp', '!=', 0),
  //         where('ipfsImageURL', '>', ''),
  //         where('image', '==', true)
  //         // orderBy('ipfsImageURL', 'desc'),
  //       ] as any[];
  //       //  @ts-ignore
  //       const q = query(...queryParams);
  //       const tempArray: Attestation[] = [];
  //       const snapshot = await getDocs(q);

  //       snapshot.forEach((s) => {
  //         const tempData = s.data() as Attestation;

  //         if (tempData.questId?.toLowerCase()?.trim() === 'lukso') {
  //           tempArray.push(tempData);
  //         }
  //       });
  //       setAttestations((t) => [...t, ...tempArray]);
  //     };

  //     resolveEnsAvatars().catch(console.log);
  //   }, []);

  useEffect(() => {
    if (!authenticated && ready) {
      redirect('/');
    }
  }, [ready, authenticated]);

  return (
    <div className="bg-denver min-h-screen">
      <div className="p-4 md:p-10 mx-auto max-w-4xl">
        <FarcasterConnectorMod2
          isActive={Boolean(farcasterName)}
          label={farcasterName ? 'Connected' : 'Connect Twitter'}
          linkedLabel={farcasterName ? farcasterName : undefined}
          action={async () => {
            if (farcasterName) {
              return unlinkFarcaster(farcasterSubject!);
            }
            linkFarcaster();
          }}
          icon={<FarcasterIcon height={18} width={18} />}
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

        {expandQuests ? (
          <div className="mb-10">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,1fr))] gap-y-2 gap-x-2 mt-2.5 grid-auto-rows-minmax mr-auto ml-auto">
              {events.map((t) => (
                <LuksoQuest
                  key={t.title}
                  {...t}
                  showModal={true}
                  setShowModal={() => {}}
                  link={t.link}
                />
              ))}
            </div>
          </div>
        ) : (
          <></>
        )}

        <button
          className="mb-5 frosty p-2 rounded-sm flex justify-between items-center w-[100%] mt-5"
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
        {expandLeaderboard ? (
          <>
            <div className="leaderboard">
              {items.map((t, index) => (
                <div className="list-fix" key={t.userWallet}>
                  <div className="number-col">#{index + 1}</div>
                  <div className="list-body pl-4 pr-4">
                    <div className="flex flex-row items-center">
                      {t.image ? (
                        <img
                          className="rounded-full mr-2"
                          width="30"
                          height="30"
                          src={t.image}
                          alt="logo"
                        />
                      ) : (
                        <img
                          className="rounded-full mr-2 grayscale"
                          width="30"
                          height="30"
                          src="https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2Fleerob.png?alt=media&token=eedc1fc0-65dc-4e6e-a546-ad3840afa293"
                          alt="logo"
                        />
                      )}

                      <div className="list-wrap">
                        {t.ensName || t.userWallet}
                      </div>
                    </div>

                    <p className="basis-24 flex-shrink-0 text-right">
                      <span>
                        {new Intl.NumberFormat().format(t.buildersPoints)}
                      </span>{' '}
                      points
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}

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
        {expandGallery ? (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,1fr))] gap-y-1 gap-x-1 mt-2.5 grid-auto-rows-minmax mr-auto ml-auto">
              {attestations.map((t) => (
                <GallryImageCard t={t} key={t.ipfsImageURL} />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
