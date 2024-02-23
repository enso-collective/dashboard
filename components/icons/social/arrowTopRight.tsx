export default function ArrowUpRightIconWithGradient() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      aria-hidden="true"
      data-slot="icon"
      width="20"
      height="20"
    >
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop
            offset="0%"
            style={{ stopColor: '#0B02FC', stopOpacity: '1' }}
          />
          <stop offset="70%" style={{ stopColor: '#e57373', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        stroke="url(#gradient)"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
      ></path>
    </svg>
  );
}
