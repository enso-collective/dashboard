export default function CanvasCardHeader({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center gap-x-3 mb-2 text-sm text-privy-color-foreground-2 ${className || ''}`}
      style={{ color: '#000' }}
    >
      {children}
    </div>
  );
}
