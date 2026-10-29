"use client";

interface TokenLogoProps {
  logoUrl?: string;
  symbol: string;
  size?: number;
}

export function TokenLogo({ logoUrl, symbol, size = 24 }: TokenLogoProps) {
  const s = size + "px";
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={symbol}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0 border border-slate-100"
        style={{ width: s, height: s }}
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    );
  }
  const bg = ["bg-blue-100 text-blue-700","bg-emerald-100 text-emerald-700",
    "bg-violet-100 text-violet-700","bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700"];
  const cls = bg[(symbol.charCodeAt(0) || 0) % bg.length];
  return (
    <div
      className={"rounded-full flex items-center justify-center flex-shrink-0 font-bold " + cls}
      style={{ width: s, height: s, fontSize: Math.round(size * 0.42) + "px" }}
    >
      {symbol.charAt(0).toUpperCase()}
    </div>
  );
}
