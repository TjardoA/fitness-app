import { isRecord } from '../utils/validation'

export interface LocalAccount { id: string; name: string; databaseName: string }
export interface AccountSession { accounts: LocalAccount[]; activeId: string | null }
const key = 'forma.accounts.v1'

function isAccount(value: unknown): value is LocalAccount {
  return isRecord(value) && typeof value.id === 'string' && !!value.id &&
    typeof value.name === 'string' && !!value.name && typeof value.databaseName === 'string' &&
    (value.databaseName === 'forma' || /^forma-account-[a-f0-9]{32}$/.test(value.databaseName))
}

function load(): AccountSession | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  const value: unknown = JSON.parse(raw)
  if (!isRecord(value) || !Array.isArray(value.accounts) ||
    !value.accounts.every(isAccount) ||
    (value.activeId !== null && typeof value.activeId !== 'string') ||
    (value.activeId !== null && !value.accounts.some(account => account.id === value.activeId))) {
    throw new Error('Your local accounts could not be read. Nothing has been removed.')
  }
  return { accounts: value.accounts, activeId: value.activeId }
}

// Only the account directory and selection live here; health data stays in IndexedDB.
export const accountStorage = {
  load,
  remove(id: string): AccountSession {
    const current = load() ?? { accounts: [], activeId: null }
    const next = { accounts: current.accounts.filter(account => account.id !== id), activeId: current.activeId === id ? null : current.activeId }
    localStorage.setItem(key, JSON.stringify(next))
    return next
  },
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
