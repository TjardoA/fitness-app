import { PageHeading } from '../components/ui'
import type { LocalAccount } from '../services/accountStorage'

interface Props {
  accounts: LocalAccount[]
  saving: boolean
  error: string
  onSignIn: (account: LocalAccount) => Promise<boolean>
  onCreate: () => void
}
export function AccountsPage({ accounts, saving, error, onSignIn, onCreate }: Props) {
  return <main className="onboarding-shell">
    <div className="brand mb-8"><span className="brand-mark">f.</span>forma</div>
    <PageHeading eyebrow="YOUR LOCAL ACCOUNTS" title="Your space is waiting." description="Choose an account or start fresh with a new one." />
    <section className="card profile-form">
      <h2>Continue with an account</h2>
      {accounts.map(account => <button key={account.id} type="button" disabled={saving}
        className="button button-secondary" onClick={() => void onSignIn(account)}>
        <span className="break-words min-w-0">{account.name}</span><span aria-hidden="true">→</span>
      </button>)}
      <button type="button" disabled={saving} className="button button-primary" onClick={onCreate}>Create new account <span aria-hidden="true">+</span></button>
      {saving && <p role="status" className="muted text-sm">Opening your account…</p>}
      {error && <p role="alert" className="text-orange text-sm">{error}</p>}
    </section>
    <p className="muted text-sm mt-5">Accounts are saved only in this browser, without passwords. Signing out keeps your data; anyone using this browser can select a saved account.</p>
  </main>
}
