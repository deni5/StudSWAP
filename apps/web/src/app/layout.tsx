import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "StudSWAP",
  description: "StudSWAP MVP DEX platform for student ERC-20 tokens on Sepolia.",
};

const navItems = [
  { href: "/tokens", label: "Tokens" },
  { href: "/register-token", label: "Register" },
  { href: "/create-pool", label: "Create Pool" },
  { href: "/add-liquidity", label: "Add Liquidity" },
  { href: "/swap", label: "Swap" },
  { href: "/vault", label: "Vault" },
  { href: "/portfolio", label: "Portfolio" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#d5e8f3] min-h-screen text-slate-800">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
              <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                <Link href="/" className="flex items-center gap-2">
                  <span className="text-xl font-bold text-blue-600">StudSWAP</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Sepolia</span>
                </Link>
                <nav className="hidden md:flex items-center gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-slate-200 bg-white/60 py-4 text-center text-xs text-slate-400">
              StudSWAP — Student ERC-20 DEX on Sepolia
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
