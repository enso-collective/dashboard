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

const events: { title: string; subtitle: string; link: string }[] = [];
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

  const twitterSubject = user?.twitter?.subject;
  const twitterUsername = user?.twitter?.username;

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
        <TwitterConnectorMod2
          isActive={Boolean(twitterUsername)}
          label={twitterUsername ? 'Connected' : 'Connect Twitter'}
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
                      <a
                        className="list-wrap"
                        href={`https://universalprofile.cloud/${t.luksoAddress}`}
                        target="_blank"
                      >
                        {t.luksoAddress}
                      </a>
                    </div>

                    <p className="basis-24 flex-shrink-0 text-right">
                      <span>
                        {new Intl.NumberFormat().format(t.pointValueLukso)}
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
