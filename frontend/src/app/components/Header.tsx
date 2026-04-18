export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-zinc-950 text-zinc-100 border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 bg-blue-500" aria-hidden />
          <span className="font-semibold tracking-[0.16em]">ポートフォリオ分析</span>
        </div>
        <div className="flex items-center gap-4 text-zinc-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
            <span>稼働中</span>
          </span>
          <span className="hidden md:inline-block">v0.1</span>
        </div>
      </div>
    </header>
  );
}
