import { Card, Title, Subtitle, Text } from '@tremor/react';
import { useEffect, useRef, useState } from 'react';
import { MoonLoader } from 'react-spinners';
import ArrowUpRightIconWithGradient from './icons/social/arrowTopRight';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const sampleData = [
  {
    points: 100,
    ensName: 'john_doe.eth',
    id: 'abc123'
  },
  { points: 75, ensName: 'alice_smith.eth', id: 'def456' },
  { points: 120, ensName: 'crypto_wizard.eth', id: 'ghi789' },
  { points: 90, ensName: 'blockchain_guru.eth', id: 'jkl012' },
  { points: 60, ensName: 'ethereum_fanatic.eth', id: 'mno345' },
  { points: 85, ensName: 'decentralized_geek.eth', id: 'pqr678' },
  { points: 110, ensName: 'smart_contract_pro.eth', id: 'stu901' },
  { points: 95, ensName: 'crypto_enthusiast.eth', id: 'vwx234' },
  { points: 80, ensName: 'eth_hodler.eth', id: 'yz012' },
  { points: 70, ensName: 'web3_ninja.eth', id: 'abc345' },
  { points: 105, ensName: 'blockchain_nomad.eth', id: 'def678' },
  { points: 88, ensName: 'eth_explorer.eth', id: 'ghi901' },
  { points: 115, ensName: 'crypto_pioneer.eth', id: 'jkl234' },
  { points: 82, ensName: 'smart_contract_ninja.eth', id: 'mno567' },
  { points: 93, ensName: 'decentralized_master.eth', id: 'pqr890' },
  { points: 98, ensName: 'ethereum_visionary.eth', id: 'stu123' },
  { points: 76, ensName: 'web3_innovator.eth', id: 'vwx456' },
  { points: 102, ensName: 'eth_advocate.eth', id: 'yz789' },
  { points: 68, ensName: 'crypto_enthusiast.eth', id: 'abc012' },
  { points: 89, ensName: 'blockchain_enthusiast.eth', id: 'def345' }
];
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
export default function HomePage() {
  const [items, setItems] = useState(sampleData);
  const [page, setPage] = useState(1);
  const loaderRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const fetchMoreData = () => {
    setLoading(true);
    // Simulate fetching more data from an API
    sleep(1000)
      .then(() => {
        setItems((t) => [
          ...t,
          ...sampleData.map((a) => ({ ...a, id: Math.random().toString() }))
        ]);
      })
      .finally(() => {
        setLoading(false);
      })
      .catch(console.error);
  };

  const handleObserver = (entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '20px', // Adjust this value based on your layout
      threshold: 1.0
    };

    const observer = new IntersectionObserver(handleObserver, options);
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    const tempRefValue = loaderRef.current;
    return () => {
      if (tempRefValue) {
        observer.unobserve(tempRefValue);
      }
    };
  }, []);

  useEffect(() => {
    fetchMoreData();
  }, [page]);

  return (
    <div className="bg-denver">
      <div className="p-4 md:p-10 mx-auto max-w-4xl">
        <div className="mb-10">
          <Title>Quests</Title>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,1fr))] gap-y-2 gap-x-2 mt-2.5 grid-auto-rows-minmax mr-auto ml-auto">
            {sampleQuestsData.map((t) => (
              <Card
                key={t.Company}
                className="flex flex-col quest-card bg-white justify-between"
              >
                <div className="mt-1 mb-5 flex items-center flex-row">
                  <img
                    src={t.Image}
                    width={20}
                    height={20}
                    alt=""
                    className="rounded-2xl mr-2"
                  />
                  <p className="">{t.Company}</p>
                </div>
                <Subtitle className="mb-5">{t.Description}</Subtitle>
                <div className="flex flex-row justify-between items-center">
                  <p>+5 points</p>
                  <ArrowUpRightIconWithGradient />
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div className="leaderboard">
          <Title className="mb-3">Leaderboard</Title>

          {items.map((t, index) => (
            <div className="list-fix" key={t.id}>
              <div className="number-col">#{index + 1}</div>
              <div className="list-body pl-4 pr-4">
                <div className="flex flex-row items-center">
                  <img
                    className="rounded-full mr-2 grayscale"
                    width="30"
                    height="30"
                    src="https://firebasestorage.googleapis.com/v0/b/enso-collective.appspot.com/o/avatars%2Fleerob.png?alt=media&token=eedc1fc0-65dc-4e6e-a546-ad3840afa293"
                    alt="logo"
                  />
                  <div className="list-wrap">{t.ensName}</div>
                </div>

                <p className="basis-24 flex-shrink-0 text-right">
                  <span>{new Intl.NumberFormat().format(t.points)}</span> points
                </p>
              </div>
            </div>
          ))}

          <div
            ref={loaderRef}
            className="bg-transparent min-h-12  mt-5 h-12 flex flex-row justify-center"
          >
            {loading ? (
              <MoonLoader size={40} color="rgba(255,255,255,.9)" />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
