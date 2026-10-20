/**
 * Page changes crossfade with a 6px rise (220ms); under reduced motion the
 * rise is zero, so it is a fade.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-page-in motion-reduce:animate-fade-in">
      {children}
    </div>
  );
}
