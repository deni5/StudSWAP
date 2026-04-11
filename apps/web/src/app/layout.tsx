"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./globals.css";
import Providers from "./providers";

const navItems = [
  { href: "/tokens", label: "Tokens" },
  { href: "/register-token", label: "Register" },
  { href: "/create-pool", label: "Create Pool" },
  { href: "/add-liquidity", label: "Add Liquidity" },
  { href: "/swap", label: "Swap" },
  { href: "/vault", label: "Vault" },
  { href: "/portfolio", label: "Portfolio" },
];

function Nav() {
  const pathname = usePathname();
  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={"rounded-lg px-3 py-2 text-sm font-medium transition-colors " + (isActive
              ? "bg-blue-50 text-blue-600 font-semibold"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

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
                <Nav />
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
