import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "StudSWAP",
  description: "StudSWAP MVP DEX platform for student ERC-20 tokens on Sepolia.",
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/tokens", label: "Tokens" },
  { href: "/register-token", label: "Register" },
  { href: "/create-pool", label: "Create Pool" },
  { href: "/add-liquidity", label: "Add Liquidity" },
  { href: "/market", label: "Market" },
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
      <body className="bg-slate-950 text-white">
        <Providers>
          <div className="min-h-screen">
            <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur">
              <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <div>
                  <Link href="/" className="text-2xl font-bold text-white">
                    StudSWAP
                  </Link>
                  <p className="text-sm text-slate-400">
                    Student ERC-20 DEX on Sepolia
                  </p>
                </div>

                <nav className="hidden flex-wrap gap-3 md:flex">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </header>

            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

