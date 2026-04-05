import Link from "next/link";

const quickFlow = [
  {
    title: "Register Token",
    description: "Add your ERC-20 token to the StudSWAP registry.",
    href: "/register-token",
    color: "bg-blue-50 border-blue-100 hover:border-blue-300",
  },
  {
    title: "Create Pool",
    description: "Launch a Uniswap V2 pair for your token.",
    href: "/create-pool",
    color: "bg-green-50 border-green-100 hover:border-green-300",
  },
  {
    title: "Add Liquidity",
    description: "Provide liquidity and set the initial price.",
    href: "/add-liquidity",
    color: "bg-purple-50 border-purple-100 hover:border-purple-300",
  },
  {
    title: "Vault / Redeem",
    description: "Lock LP tokens and receive receipt tokens.",
    href: "/vault",
    color: "bg-amber-50 border-amber-100 hover:border-amber-300",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center px-6 py-16 space-y-12">
      <div className="text-center space-y-4 max-w-2xl">
        <div className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-sm text-amber-700 font-medium">
          Sepolia Testnet
        </div>
        <h1 className="text-4xl font-bold text-slate-800 md:text-5xl">
          Student Token DEX
        </h1>
        <p className="text-lg text-slate-500">
          Register your ERC-20 token, create trading pairs, add liquidity — all on Sepolia.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/tokens"
            className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            View Tokens
          </Link>
          <Link
            href="/register-token"
            className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Register Token
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 w-full max-w-5xl">
        {quickFlow.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={"rounded-2xl border p-5 transition-all " + item.color}
          >
            <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
