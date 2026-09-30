import type { AppData, FoodEntry, NutritionDay, NutritionTargets, UserProfile, WeightEntry } from '../types/models'
import { isDate, localDate } from '../utils/dates'
import type { WorkoutPlan } from '../types/models'
import { validCustomExercises } from '../utils/exerciseLibrary'
import { emptyWorkoutPlan, type CatalogExercise } from '../data/exercises'
import { parseWorkoutPlan, validWorkoutPlan } from '../utils/workoutPlan'
import { isRecord, validFood, validProfile, validTargets, validWeight } from '../utils/validation'

const stores = ['profiles', 'nutrition', 'weights', 'workouts', 'workoutPlans', 'customExercises'] as const

function openDatabase(databaseName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let blocked = false
    const request = indexedDB.open(databaseName, 4)
    request.onupgradeneeded = () => {
      // Preserve all version-1 stores, including future measurements in "progress".
      for (const name of [...stores, 'progress']) {
        if (!request.result.objectStoreNames.contains(name)) request.result.createObjectStore(name, { keyPath: 'id' })
      }
    }
    request.onblocked = () => {
      blocked = true
      reject(new Error('Close other Forma tabs, then retry. A local database update is waiting.'))
    }
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      if (blocked) { request.result.close(); return }
      request.result.onversionchange = () => request.result.close()
      resolve(request.result)
    }
  })
}

// Resolve writes only after the whole transaction has committed.
async function transact<T>(
  databaseName: string, names: string[], mode: IDBTransactionMode,
  operation: (transaction: IDBTransaction, result: (value: T) => void) => void,
): Promise<T> {
  const database = await openDatabase(databaseName)
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(names, mode)
    let result: T
    transaction.oncomplete = () => { database.close(); resolve(result) }
    transaction.onabort = () => { database.close(); reject(transaction.error ?? new Error('Local storage operation failed. Please retry.')) }
    try { operation(transaction, value => { result = value }) }
    catch (error) { transaction.abort(); database.close(); reject(error) }
  })
}

export interface DataRepository {
  load(): Promise<AppData>
  deleteAccountData(): Promise<void>
  saveWorkoutPlan(plan: WorkoutPlan, customExercises?: CatalogExercise[]): Promise<void>
  saveProfile(profile: UserProfile, weight?: WeightEntry): Promise<void>
  saveFood(date: string, targets: NutritionTargets, entry: FoodEntry): Promise<NutritionDay>
  deleteFood(date: string, id: string): Promise<NutritionDay>
  addWeight(entry: WeightEntry, profile: UserProfile): Promise<UserProfile>
}

// Each local account gets its own database, including future workout/progress records.
export function createDataRepository(databaseName: string): DataRepository {
  return {
    async saveWorkoutPlan(plan, customExercises) {
      const custom = customExercises ?? (await this.load()).customExercises
      if (!validCustomExercises(custom)) throw new Error('Check your custom exercise details before saving.')
      if (!validWorkoutPlan(plan, custom)) throw new Error('Check your day names, muscle groups, sets, reps, weight and rest time before saving.')
      return transact<void>(databaseName, ['workoutPlans','customExercises'], 'readwrite', (transaction, done) => {
        transaction.objectStore('workoutPlans').put(plan)
        transaction.objectStore('customExercises').clear()
        for (const exercise of custom) transaction.objectStore('customExercises').put(exercise)
        done()
      })
    },
    async deleteAccountData() {
      const database = await openDatabase(databaseName)
      // Include legacy and future stores so no account history is left behind.
      const names = Array.from(database.objectStoreNames)
      return new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(names, 'readwrite')
        transaction.oncomplete = () => { database.close(); resolve() }
        transaction.onabort = () => { database.close(); reject(transaction.error ?? new Error('Account deletion failed. Please retry.')) }
        for (const name of names) transaction.objectStore(name).clear()
      })
    },
    async load() {
      const result = await transact<AppData>(databaseName, [...stores], 'readonly', (transaction, done) => {
        const data: AppData = { profile: null, nutrition: [], weights: [], workouts: [], customExercises: [], workoutPlan: emptyWorkoutPlan() }
        transaction.objectStore('customExercises').getAll().onsuccess = event => { data.customExercises = (event.target as IDBRequest<CatalogExercise[]>).result }
        transaction.objectStore('workoutPlans').get('weekly-plan').onsuccess = event => {
          data.workoutPlan = (event.target as IDBRequest<WorkoutPlan | undefined>).result ?? emptyWorkoutPlan()
        }
        transaction.objectStore('profiles').getAll().onsuccess = event => {
          const profiles = (event.target as IDBRequest<UserProfile[]>).result
          data.profile = profiles[0] ?? null
        }
        transaction.objectStore('nutrition').getAll().onsuccess = event => {
          data.nutrition = (event.target as IDBRequest<NutritionDay[]>).result
        }
        transaction.objectStore('weights').getAll().onsuccess = event => {
          data.weights = (event.target as IDBRequest<WeightEntry[]>).result
        }
        transaction.objectStore('workouts').getAll().onsuccess = event => {
          data.workouts = (event.target as IDBRequest<AppData['workouts']>).result
        }
        done(data)
      })
      // TypeScript cannot validate persisted data: check at the storage boundary.
      if (result.profile && !validProfile(result.profile)) throw new Error('Saved profile data could not be read. Nothing has been overwritten.')
      if (!validCustomExercises(result.customExercises)) throw new Error('Saved custom exercises could not be read. Nothing has been overwritten.')
      result.workoutPlan = parseWorkoutPlan(result.workoutPlan, result.customExercises)
      if (!result.weights.every(validWeight) || !result.nutrition.every(day =>
        isRecord(day) && isDate(day.date) && day.id === day.date &&
        validTargets(day.targets) && Array.isArray(day.entries) && day.entries.every(validFood))) {
        throw new Error('Saved history could not be read. Nothing has been overwritten.')
      }
      return result
    },
    async saveProfile(profile, weight) {
      if (!validProfile(profile) || (weight && !validWeight(weight))) throw new Error('Check your profile details before saving.')
      return transact<void>(databaseName, ['profiles', 'weights', 'nutrition'], 'readwrite', (transaction, done) => {
        transaction.objectStore('profiles').put(profile)
        if (weight) transaction.objectStore('weights').add(weight)
        const nutrition = transaction.objectStore('nutrition')
        const request = nutrition.get(localDate())
        request.onsuccess = () => {
          const today = request.result as NutritionDay | undefined
          if (today) nutrition.put({ ...today, targets: profile.targets })
        }
        done()
      })
    },
    async saveFood(date, targets, entry) {
      if (!isDate(date) || date > localDate() || !validTargets(targets) || !validFood(entry)) throw new Error('Check the food details and date.')
      return transact<NutritionDay>(databaseName, ['nutrition'], 'readwrite', (transaction, done) => {
        const store = transaction.objectStore('nutrition')
        store.get(date).onsuccess = event => {
          const saved = (event.target as IDBRequest<NutritionDay | undefined>).result
          const day: NutritionDay = saved ?? { id: date, date, targets, entries: [] }
          const index = day.entries.findIndex(item => item.id === entry.id)
          if (index === -1) day.entries.push(entry)
          else day.entries[index] = entry
          store.put(day)
          done(day)
        }
      })
    },
    async deleteFood(date, id) {
      return transact<NutritionDay>(databaseName, ['nutrition'], 'readwrite', (transaction, done) => {
        const store = transaction.objectStore('nutrition')
        store.get(date).onsuccess = event => {
          const day = (event.target as IDBRequest<NutritionDay | undefined>).result
          if (!day) { transaction.abort(); return }
          const next = { ...day, entries: day.entries.filter(entry => entry.id !== id) }
          store.put(next)
          done(next)
        }
      })
    },
    async addWeight(entry, profile) {
      if (!validWeight(entry)) throw new Error('Enter a valid weight and a date no later than today.')
      return transact<UserProfile>(databaseName, ['weights', 'profiles'], 'readwrite', (transaction, done) => {
        const weights = transaction.objectStore('weights')
        weights.add(entry)
        weights.getAll().onsuccess = event => {
          const entries = (event.target as IDBRequest<WeightEntry[]>).result
          const latest = entries.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))[0]
          const profiles = transaction.objectStore('profiles')
          profiles.get(profile.id).onsuccess = event => {
            const current = (event.target as IDBRequest<UserProfile | undefined>).result ?? profile
            const next = { ...current, weightKg: latest.weightKg }
            profiles.put(next) // Targets are deliberately unchanged.
            done(next)
          }
        }
      })
    },
  }
}

// Retain the existing database for the original account without moving its history.
export const dataRepository = createDataRepository('forma')

