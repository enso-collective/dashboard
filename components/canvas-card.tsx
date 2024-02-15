export default function CanvasCard({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`canvas-card border border-privy-color-foreground-4 bg-privy-color-background p-4 shadow-lg ${className || ''} mb-2 canvas-card rounded-[0.75rem]`}
    >
      {children}
    </div>
  );
}
