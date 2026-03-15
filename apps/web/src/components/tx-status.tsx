"use client";

export type TxStatusKind = "pending" | "success" | "failed";

export function TxStatus({
  status,
  message,
}: {
  status: TxStatusKind;
  message?: string;
}) {
  const styles =
    status === "pending"
      ? "border-yellow-700 bg-yellow-950/40 text-yellow-300"
      : status === "success"
      ? "border-green-700 bg-green-950/40 text-green-300"
      : "border-red-700 bg-red-950/40 text-red-300";

  const label =
    status === "pending"
      ? "Pending"
      : status === "success"
      ? "Success"
      : "Failed";

  return (
    <div className={`rounded-xl border p-4 ${styles}`}>
      <p className="font-semibold">Transaction status: {label}</p>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
