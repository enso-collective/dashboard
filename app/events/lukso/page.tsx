'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, Subtitle, Title } from '@tremor/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { usePrivy, useWallets, WalletWithMetadata } from '@privy-io/react-auth';
import { redirect } from 'next/navigation';
import { connectLukso, readLuksoProfile } from '../../../lib/lukso';
import {
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

const events = [
  {
    title: 'Tweet from SafeCON',
    subtitle:
      'Share your unique insights or a key takeaway from SafeCON in a tweet. Did you meet the LUKSO team? Did you learn about Universal Profiles or LSPs? #ProofOfLUKSO',
    link: 'https://twitter.com/intent/tweet?text=Had+an+amazing+time+at+SafeCON!+Met+the+LUKSO+team+and+learned+so+much+about+Universal+Profiles+and+LSPs.+%23ProofOfLUKSO'
  },
  {
    title: "Insights from Hugo's Workshop @ SafeCON (5:35 PM - 5:55 PM)",
    subtitle:
      'Attend Hugo\'s workshop on "From Key Management to Custom Metadata and Relayed Calls" Tweet your top takeaway or photo of the workshop in action! #ProofOfLUKSO',
    link: 'https://twitter.com/intent/tweet?text=Attended+Hugo%E2%80%99s+workshop+on+%E2%80%9CFrom+Key+Management+to+Custom+Metadata+and+Relayed+Calls%E2%80%9D+at+SafeCON.+Top+takeaway%3A+[insert+your+insight]!+%23ProofOfLUKSO'
  },
  {
    title: "Learnings from Jean's Workshop @ SafeCON (6:00 PM - 6:20 PM)",
    subtitle:
      'Attend Jean\'s workshop on "An In-depth View into Universal Profiles and Their Capabilities" Tweet your top takeaway or photo of the workshop in action! #ProofOfLUKSO',
    link: 'https://twitter.com/intent/tweet?text=Jean%E2%80%99s+workshop+on+%E2%80%9CAn+In-depth+View+into+Universal+Profiles+and+Their+Capabilities%E2%80%9D+was+so+insightful!+Top+takeaway%3A+[insert+your+insight]+%23ProofOfLUKSO'
  },
  {
    title:
      'Attend Fabian\'s Panel Talk on "Smart Account Use Cases" (6:00 PM - 6:20 PM)',
    subtitle:
      'Tweet your top takeaway or photo of the panel talk in action! #ProofOfLUKSO',
    link: 'https://twitter.com/intent/tweet?text=Fabian%E2%80%99s+panel+on+%E2%80%9CSmart+Account+Use+Cases%E2%80%9D+was+super+informative!+Top+takeaway%3A+[insert+your+insight]+%23ProofOfLUKSO'
  },
  {
    title: 'Capture the LUKSO Blockhaus Afterparty Vibe',
    subtitle:
      'Tweet about your experience at the LUKSO Blockhaus Afterparty. How many pink clouds can you spot? #ProofOfLUKSO',
    link: ''
  },
  {
    title: 'Show Off Your LUKSO Merch',
    subtitle:
      'Post a photo of your new LUKSO merch. Be creative with your pose or setting. #ProofOfLUKSO',
    link: ''
  },
  {
    title: 'Polaroid Moments at LUKSO Blockhaus Afterparty',
    subtitle:
      'Post a photo of your Polaroid picture taken at the LUKSO Blockhaus Afterparty. #ProofOfLUKSO',
    link: ''
  },
  {
    title: 'Reflect Your Style in the #ProofOfLUKSO Mirror',
    subtitle:
      'Post a photo of yourself in the #ProofOfLUKSO mirror at the LUKSO Blockhaus Afterparty',
    link: ''
  }
];
interface ProofOfLUKSOEvent {
  title: string;
  subtitle: string;
  showModal: boolean;
  setShowModal: Function;
  link: string;
}
function LuksoQuest({
  title,
  subtitle,
  link,
  showModal,
  setShowModal
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
        <p>+100 points</p>
        <Tooltip id="lukso-tooltip" />
        {link.length > 0 ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            <ArrowUpRightIconWithGradient />
          </a>
        ) : (
          <a
            data-tooltip-id="lukso-tooltip"
            data-tooltip-content="Enabled at the Afterparty"
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
  const { authenticated, ready, user, linkTwitter, unlinkTwitter } = usePrivy();
  const [luksoAddress, setLuksoAddress] = useState(() => {
    try {
      return localStorage.getItem('luksoAddress');
    } catch (error) {
      return null;
    }
  });
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
  useEffect(() => {
    getDocs(
      query(
        usersRef.current,
        orderBy('pointValueLukso', 'desc'),
        where('luksoAddress', '>', ''),
        limit(100)
      )
    )
      .then((snapshot) => {
        const tempArr: any[] = [];
        snapshot.forEach((d) => tempArr.push(d.data() as any));
        setUsers(tempArr);
      })
      .catch(console.log);
  }, [setUsers]);

  useEffect(() => {
    if (primaryWallet && luksoAddress) {
      const q = query(
        collection(db, 'User'),
        or(
          where('userWallet', '==', primaryWallet),
          where('userWalletToLowerCase', '==', primaryWallet),
          where('userWalletLower', '==', primaryWallet)
        ),
        limit(1)
      );
      const payload = {
        luksoAddress: luksoAddress.toLowerCase().trim()
      } as any;
      getDocs(q)
        .then(async (snapshot) => {
          if (snapshot.empty) {
            return;
          }
          snapshot.forEach(async (s) => {
            try {
              const docRef = doc(db, 'User', s.id);
              await updateDoc(docRef, { ...payload });
              console.log('Lusko profile updated!');
            } catch (error) {
              console.log(error);
            }
          });
        })
        .catch(console.log);
    }
  }, [primaryWallet, luksoAddress]);

  const twitterSubject = user?.twitter?.subject;
  const twitterUsername = user?.twitter?.username;

  const [attestations, setAttestations] = useState<Attestation[]>([]);

  // const [luksoProfile, setLuksoProfile] = useState<any>();

  // useEffect(() => {
  //   if (luksoAddress) {

  //     readLuksoProfile(luksoAddress).then(setLuksoProfile);
  //   }
  // }, [luksoAddress, setLuksoProfile]);

  useEffect(() => {
    const resolveEnsAvatars = async () => {
      const queryParams = [
        proofsRef.current,
        orderBy('timestamp', 'desc'),
        where('timestamp', '!=', 0),
        where('ipfsImageURL', '>', ''),
        where('image', '==', true)
        // orderBy('ipfsImageURL', 'desc'),
      ] as any[];
      //  @ts-ignore
      const q = query(...queryParams);
      const tempArray: Attestation[] = [];
      const snapshot = await getDocs(q);

      snapshot.forEach((s) => {
        const tempData = s.data() as Attestation;

        if (tempData.questId?.toLowerCase()?.trim() === 'lukso') {
          tempArray.push(tempData);
        }
      });
      setAttestations((t) => [...t, ...tempArray]);
    };

    resolveEnsAvatars().catch(console.log);
  }, []);

  useEffect(() => {
    if (!authenticated && ready) {
      redirect('/');
    }
  }, [ready, authenticated]);

  return (
    <div className="bg-denver min-h-screen">
      <div className="p-4 md:p-10 mx-auto max-w-4xl">
        <TwitterConnectorMod2
          isActive={Boolean(twitterUsername)}
          label={luksoAddress ? 'Connected' : 'Connect Twitter'}
          linkedLabel={twitterUsername ? twitterUsername : undefined}
          action={async () => {
            if (twitterUsername) {
              return unlinkTwitter(twitterSubject!);
            }
            linkTwitter();
          }}
          icon={<TwitterXIcon height={18} width={18} />}
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

        <LuksoConnectorMod2
          icon={
            <img
              src="https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2Flukso.png?alt=media&token=c455efa6-2865-4ec6-b1d5-0492b9e4a66d"
              height={18}
              width={18}
            />
          }
          isActive={Boolean(luksoAddress)}
          label={luksoAddress ? 'Connected' : 'Connect'}
          action={async () => {
            if (luksoAddress) {
              localStorage.removeItem('luksoAddress');
              return setLuksoAddress(null);
            }
            try {
              const { account } = await connectLukso();
              localStorage.setItem('luksoAddress', account);
              setLuksoAddress(account);
            } catch (error) {
              console.error(error);
            }
          }}
          linkedLabel={
            luksoAddress
              ? luksoAddress.slice(0, 5) + '...' + luksoAddress.slice(-5)
              : undefined
          }
        />

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
              {users.map((t, index) => (
                <div className="list-fix" key={t.id}>
                  <div className="number-col">#{index + 1}</div>
                  <div className="list-body pl-4 pr-4">
                    <div className="flex flex-row items-center">
                      {/* {t.image ? (
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
                      )} */}

                      <div className="list-wrap">{t.luksoAddress}</div>
                    </div>

                    <p className="basis-24 flex-shrink-0 text-right">
                      <span>{new Intl.NumberFormat().format(t.points)}</span>{' '}
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
