import { useEffect, useRef, useState } from 'react'
import type { AppData, FoodEntry, NutritionDay, NutritionTargets, UserProfile, WeightEntry } from '../types/models'
import { createDataRepository, dataRepository } from '../services/dataRepository'
import { accountStorage, type LocalAccount } from '../services/accountStorage'
import { profileStorage } from '../services/profileStorage'
import { localDate, newId } from '../utils/dates'

const emptyData = (): AppData => ({ profile: null, nutrition: [], weights: [], workouts: [] })

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null)
  const [accounts, setAccounts] = useState<LocalAccount[]>([])
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [legacy, setLegacy] = useState<Partial<UserProfile> | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const savingRef = useRef(false)
  // An explicit repository instance prevents one account's writes reaching another database.
  const repository = useRef(dataRepository)
  const databaseName = useRef('forma')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        let session = accountStorage.load()
        let result = emptyData()
        let name = 'forma'
        if (!session) {
          result = await dataRepository.load()
          if (!active) return
          // Register the original account in place; its records are never moved or deleted.
          if (result.profile) session = accountStorage.activate({ id: result.profile.id, name: result.profile.name, databaseName: name })
        } else if (session.activeId) {
          const activeId = session.activeId
          const account = session.accounts.find(item => item.id === activeId)!
          name = account.databaseName
          result = await createDataRepository(name).load()
          if (!result.profile || result.profile.id !== account.id) throw new Error('This local account could not be opened. Your data has not been changed.')
        }
        const savedAccounts = session?.accounts ?? []
        const oldProfile = !savedAccounts.length && !result.profile ? profileStorage.loadLegacy() : null
        if (active) {
          repository.current = createDataRepository(name)
          databaseName.current = name
          setData(result); setAccounts(savedAccounts); setLegacy(oldProfile)
          setCreatingAccount(!savedAccounts.length); setError('')
        }
      } catch (error) {
        if (active) setError(error instanceof Error ? error.message : 'Could not open local storage.')
      } finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [attempt])

  async function perform(operation: () => Promise<void>) {
    if (savingRef.current) return false
    savingRef.current = true
    setSaving(true); setError('')
    try { await operation(); return true }
    catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save. Please try again.')
      return false
    } finally { savingRef.current = false; setSaving(false) }
  }
  function updateDay(day: NutritionDay) {
    setData(previous => previous && ({ ...previous, nutrition: [...previous.nutrition.filter(item => item.id !== day.id), day] }))
  }
  function saveProfile(profile: UserProfile) {
    return perform(async () => {
      // Re-read during onboarding so a retried account-directory write never adds a second initial weigh-in.
      const current = data?.profile ? data : await repository.current.load()
      const needsWeight = !current.profile || current.profile.weightKg !== profile.weightKg
      const weight: WeightEntry | undefined = needsWeight
        ? { id: newId(), date: localDate(), weightKg: profile.weightKg, createdAt: new Date().toISOString() } : undefined
      await repository.current.saveProfile(profile, weight)
      const session = accountStorage.activate({ id: profile.id, name: profile.name, databaseName: databaseName.current })
      setAccounts(session.accounts)
      setData({
        ...current, profile, weights: weight ? [...current.weights, weight] : current.weights,
        nutrition: current.nutrition.map(day => day.date === localDate() ? { ...day, targets: profile.targets } : day),
      })
      setLegacy(null); setCreatingAccount(false)
    })
  }
  function signOut() {
    return perform(async () => {
      const session = accountStorage.signOut()
      setAccounts(session.accounts); setData(emptyData()); setLegacy(null); setCreatingAccount(false)
      window.location.hash = '/home'
    })
  }
  function signIn(account: LocalAccount) {
    return perform(async () => {
      const nextRepository = createDataRepository(account.databaseName)
      const next = await nextRepository.load()
      if (!next.profile || next.profile.id !== account.id) throw new Error('This account could not be opened. Its data has not been changed.')
      const session = accountStorage.activate({ ...account, name: next.profile.name })
      repository.current = nextRepository; databaseName.current = account.databaseName
      setAccounts(session.accounts); setData(next); setLegacy(null); setCreatingAccount(false)
      window.location.hash = '/home'
    })
  }
  function createAccount() {
    if (savingRef.current) return
    databaseName.current = 'forma-account-' + newId()
    repository.current = createDataRepository(databaseName.current)
    setData(emptyData()); setLegacy(null); setError(''); setCreatingAccount(true)
  }
  return {
    data, accounts, creatingAccount, legacy, error, loading, saving,
    retry: () => { setLoading(true); setAttempt(value => value + 1) },
    saveProfile, signOut, signIn, createAccount,
    cancelCreate: () => { if (!savingRef.current) { setCreatingAccount(false); setError('') } },
    saveFood: (date: string, targets: NutritionTargets, entry: FoodEntry) =>
      perform(async () => updateDay(await repository.current.saveFood(date, targets, entry))),
    deleteFood: (date: string, id: string) =>
      perform(async () => updateDay(await repository.current.deleteFood(date, id))),
    addWeight: (entry: WeightEntry) => perform(async () => {
      if (!data?.profile) throw new Error('Complete your profile first.')
      const profile = await repository.current.addWeight(entry, data.profile)
      setData(previous => previous && ({ ...previous, profile, weights: [...previous.weights, entry] }))
    }),
  }
}
export type AppActions = Pick<ReturnType<typeof useAppData>, 'saveProfile' | 'saveFood' | 'deleteFood' | 'addWeight'>
