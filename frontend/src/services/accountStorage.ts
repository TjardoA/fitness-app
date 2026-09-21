import { isRecord } from '../utils/validation'

export interface LocalAccount { id: string; name: string; databaseName: string }
export interface AccountSession { accounts: LocalAccount[]; activeId: string | null }
const key = 'forma.accounts.v1'

function load(): AccountSession | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  const value: unknown = JSON.parse(raw)
  if (!isRecord(value) || !Array.isArray(value.accounts) ||
    !value.accounts.every(account => isRecord(account) &&
      typeof account.id === 'string' && !!account.id &&
      typeof account.name === 'string' && !!account.name &&
      typeof account.databaseName === 'string' &&
      (account.databaseName === 'forma' || /^forma-account-[a-f0-9]{32}$/.test(account.databaseName))) ||
    (value.activeId !== null && !value.accounts.some(account => account.id === value.activeId))) {
    throw new Error('Your local accounts could not be read. Nothing has been removed.')
  }
  return value as unknown as AccountSession
}

// Only the account directory and selection live here; health data stays in IndexedDB.
export const accountStorage = {
  load,
  activate(account: LocalAccount): AccountSession {
    const current = load() ?? { accounts: [], activeId: null }
    const next = { accounts: [...current.accounts.filter(item => item.id !== account.id), account], activeId: account.id }
    localStorage.setItem(key, JSON.stringify(next))
    return next
  },
  signOut(): AccountSession {
    const current = load() ?? { accounts: [], activeId: null }
    const next = { ...current, activeId: null }
    localStorage.setItem(key, JSON.stringify(next))
    return next
  },
}
