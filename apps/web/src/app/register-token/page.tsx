'use client'

import { useMemo, useState } from 'react'

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

type FormState = {
  tokenAddress: string
  title: string
  description: string
  category: string
  logoUrl: string
  baseToken: string
  bonusEnabled: boolean
  rewardAsset: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

export default function RegisterTokenPage() {
  const [form, setForm] = useState<FormState>({
    tokenAddress: '',
    title: '',
    description: '',
    category: '',
    logoUrl: '',
    baseToken: '',
    bonusEnabled: false,
    rewardAsset: '',
  })

  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    tokenAddress: false,
    title: false,
    description: false,
    category: false,
    logoUrl: false,
    baseToken: false,
    bonusEnabled: false,
    rewardAsset: false,
  })

  const errors = useMemo<FormErrors>(() => {
    const next: FormErrors = {}

    if (!form.tokenAddress) next.tokenAddress = 'Token address is required'
    else if (!ADDRESS_REGEX.test(form.tokenAddress)) next.tokenAddress = 'Token address must be a valid 0x... address'

    if (!form.title) next.title = 'Title is required'
    if (!form.description) next.description = 'Description is required'
    if (!form.category) next.category = 'Category is required'
    if (!form.baseToken) next.baseToken = 'Base token is required'

    if (form.bonusEnabled && form.rewardAsset && !ADDRESS_REGEX.test(form.rewardAsset)) {
      next.rewardAsset = 'Reward asset must be a valid address'
    }

    return next
  }, [form])

  const isValid = Object.keys(errors).length === 0

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({
      tokenAddress: true,
      title: true,
      description: true,
      category: true,
      logoUrl: true,
      baseToken: true,
      bonusEnabled: true,
      rewardAsset: true,
    })

    if (!isValid) return

    // TODO: wire to StudentTokenRegistry contract
  }

  const handleBlur = (key: keyof FormState) => () =>
    setTouched((prev) => ({ ...prev, [key]: true }))

  const handleChange = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value =
      e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value

    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const showError = (key: keyof FormState) =>
    touched[key] && errors[key] ? (
      <p className="text-xs text-red-600 mt  1">{errors[key]}</p>
    ) : null

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-bold">Register Token</h1>
          <p className="text-muted-foreground mt-2">
            Add a student token to the platform registry.
          </p>
        </header>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Token address</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="0x..."
                value={form.tokenAddress}
                onChange={handleChange('tokenAddress')}
                onBlur={handleBlur('tokenAddress')}
              />
              {showError('tokenAddress')}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Example Token"
                value={form.title}
                onChange={handleChange('title')}
                onBlur={handleBlur('title')}
              />
              {showError('title')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Short description..."
              rows={3}
              value={form.description}
              onChange={handleChange('description')}
              onBlur={handleBlur('description')}
            />
            {showError('description')}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Faculty / category"
                value={form.category}
                onChange={handleChange('category')}
                onBlur={handleBlur('category')}
              />
              {showError('category')}
            </div>

            <div>
              <label className="block text-sm font-medium mb  1">Logo URL</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="https://..."
                value={form.logoUrl}
                onChange={handleChange('logoUrl')}
                onBlur={handleBlur('logoUrl')}
              />
              {showError('logoUrl')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Base token</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              placeholder="WETH / registered token address"
              value={form.baseToken}
              onChange={handleChange('baseToken')}
              onBlur={handleBlur('baseToken')}
            />
            {showError('baseToken')}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.bonusEnabled}
                onChange={handleChange('bonusEnabled')}
                onBlur={handleBlur('bonusEnabled')}
              />
              <span className="text-sm text-gray-700">Enable 30-day redeem with bonus</span>
            </label>

            <div>
              <label className="block text-sm font-medium mb-1">Reward asset</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="0x... reward token address (optional)"
                value={form.rewardAsset}
                onChange={handleChange('rewardAsset')}
                onBlur={handleBlur('rewardAsset')}
              />
              {showError('rewardAsset')}
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="mt-2 w-full rounded-lg bg-blue-600 text-white py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit (placeholder)
          </button>

          {!isValid && (
            <p className="text-xs text-gray-500">Fill all required fields to enable submit.</p>
          )}
        </form>
      </section>
    </main>
  )
}
