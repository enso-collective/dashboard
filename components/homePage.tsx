import { Card, List, ListItem, Title, Subtitle, Text } from '@tremor/react';
import { useEffect, useRef, useState } from 'react';
import { MoonLoader } from 'react-spinners';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const sampleData = [
  { points: 100, ensName: 'john_doe.eth', id: 'abc123' },
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
      <div className="p-4 md:p-10 mx-auto max-w-7xl">
        <div className="mb-10">
          <Title>Quests</Title>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-y-4 gap-x-4 mt-2.5 grid-auto-rows-minmax">
            {sampleQuestsData.map((t) => (
              <Card key={t.Company} className="flex flex-col">
                <Title>{t.Company}</Title>
                <div className="mt-auto">
                  <div className="mt-6 mb-3">
                    <img
                      src={t.Image}
                      width={30}
                      height={30}
                      alt=""
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="flex flex-row justify-between items-center">
                    <Subtitle className="">
                      {t.Description.split(' ')[0]}
                    </Subtitle>

                    <div className="flex flex-row items-center">
                      <div className="flex flex-row mr-[-10px] items-center">
                        <img
                          src="https://fastly.picsum.photos/id/866/20/20.jpg?hmac=1beQxVWtDOMlb_hrFordZMrI1QQvEchw0E17oQYe8uo"
                          alt=""
                          className="rounded-2xl border-2 border-solid border-gray-300"
                        />
                        <img
                          src="https://fastly.picsum.photos/id/641/20/20.jpg?hmac=17LTfp-U5z9I2-TfIodgbaxAwi2gzzqu3MVSlsyKvqE"
                          alt=""
                          className="rounded-2xl border-2 border-solid border-gray-300 transform translate-x-[-30%]"
                        />
                        <img
                          src="https://fastly.picsum.photos/id/953/20/20.jpg?hmac=g-Y39CdULsUGhNRnl9xEyME7R_P_jk6B5xQbE5bIw9Y"
                          alt=""
                          className="rounded-2xl border-2 border-solid border-gray-300 transform translate-x-[-60%]"
                        />
                      </div>
                      <Text>+{new Intl.NumberFormat().format(t.Points)}</Text>
                    </div>
                  </div>
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
                <div style={{ fontWeight: '600' }} className="list-wrap">
                  {t.ensName}
                </div>

                <p>
                  <span style={{ fontWeight: '600' }}>
                    {new Intl.NumberFormat().format(t.points)}
                  </span>{' '}
                  points
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
