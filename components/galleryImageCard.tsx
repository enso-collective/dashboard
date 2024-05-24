import ArrowUpRightIconWithGradient from './icons/social/arrowTopRight';

export default function GallryImageCard({ t }: { t: any }) {
  return (
    <div
      tabIndex={1}
      className="p-0 overflow-hidden card-flip"
      style={{ borderWidth: 0, borderRadius: '0px' }}
    >
      <div className="card-inner flex flex-col grid-card cursor-pointer justify-end ">
        <div className="card-front">
          <img src={t.ipfsImageURL} alt="" className="front-image" />
        </div>
        <div className="card-back bg-white p-2 flex flex-col space-between">
          <div tabIndex={2} className="flex-1 flex flex-col justify-start">
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
          </div>
          <div className="flex flex-row justify-between items-center ">
            <div tabIndex={3} className="flex-1">
              <p>+{t.pointValue} points</p>
            </div>
            {!t?.transaction ? null : (
              <span
                className="cursor-pointer pl-5"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(`https://www.onceupon.gg/${t.transaction}`);
                }}
              >
                <ArrowUpRightIconWithGradient />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
