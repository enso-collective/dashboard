export default function ArrowUpRightIconWithGradient() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      aria-hidden="true"
      data-slot="icon"
      width="18"
      height="18"
    >
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop
            offset="0%"
            style={{ stopColor: 'hsl(238,87%,69%)', stopOpacity: '1' }}
          />
          <stop
            offset="100%"
            style={{ stopColor: '#fca5a5', stopOpacity: 1 }}
          />
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
