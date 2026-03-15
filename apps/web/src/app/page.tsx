import Link from "next/link";

const quickFlow = [
  {
    title: "Register Token",
    description: "Add a student ERC-20 token to the StudSWAP registry.",
    href: "/register-token",
  },
  {
    title: "Create Pair",
    description: "Prepare a trading pair between a token and an allowed base asset.",
    href: "/create-pool",
  },
  {
    title: "Add Liquidity",
    description: "Provide initial liquidity and establish a reference market price.",
    href: "/add-liquidity",
  },
  {
    title: "Vault / Redeem",
    description: "Lock LP positions, receive receipt tokens, and redeem later.",
    href: "/vault",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex rounded-full border border-amber-700 bg-amber-950/40 px-4 py-2 text-sm text-amber-300">
            Sepolia testnet only
          </div>

          <h1 className="text-4xl font-bold md:text-5xl">
            DeFiLab Student Token Platform
          </h1>

          <p className="max-w-3xl text-lg text-slate-300">
            StudSWAP is a student-oriented DEX prototype for registering ERC-20
            tokens, creating pairs, adding liquidity, and preparing LP vault
            mechanics on Sepolia.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/tokens"
              className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-500"
            >
              View Tokens
            </Link>
            <Link
              href="/register-token"
              className="rounded-xl border border-slate-600 px-5 py-3 font-medium text-white hover:bg-slate-800"
            >
              Register Token
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-2xl font-semibold">Wallet Status</h2>
          <p className="mt-3 text-slate-300">
            Wallet connection UI is prepared in the project foundation and will
            be reattached after the registry flow is fully wired.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {quickFlow.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-600 hover:bg-slate-800"
            >
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-400">{item.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
