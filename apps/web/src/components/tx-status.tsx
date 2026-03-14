import React from 'react'

export type TxStatusState = 'pending' | 'success' | 'failed'

export function TxStatus({ state }: { state: TxStatusState }) {
  if (!state) return null

  const label = state === 'pending' ? 'Pending' : state === 'success' ? 'Success' : 'Failed'
  const color =
    state === 'pending' ? 'bg-yellow-50 text-yellow-900 border-yellow-200' :
    state === 'success' ? 'bg-green-50 text-green-900 border-green-200' :
    'bg-red-50 text-red-900 border-red-200'

  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${color}`}>
      Tx status: {label}
    </div>
  )
}
