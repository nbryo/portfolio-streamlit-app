export default function Header() {
  return (
    <header
      className="sticky top-0 z-20 bg-zinc-950 text-zinc-100 border-b border-zinc-800"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-3 flex items-center text-xs">
        <div className="flex items-center gap-2.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ffb703]" aria-hidden />
          <span className="font-semibold">ポートフォリオ分析</span>
        </div>
      </div>
    </header>
  );
}
