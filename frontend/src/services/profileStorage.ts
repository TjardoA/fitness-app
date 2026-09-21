import type { UserProfile } from '../types/models'
import { goalLabels } from '../data/profileOptions'
import { isRecord, inRange } from '../utils/validation'

// Read-only migration of the small profile created in phase 1.
// The original record stays untouched; completed profiles now live in IndexedDB.
export const profileStorage = {
  loadLegacy(): Partial<UserProfile> | null {
    const raw = localStorage.getItem('forma.profile.v1')
    if (!raw) return null
    const value: unknown = JSON.parse(raw)
    if (!isRecord(value)) throw new Error('The old profile could not be read.')
    const profile: Partial<UserProfile> = {}
    if (typeof value.id === 'string') profile.id = value.id
    if (typeof value.name === 'string') profile.name = value.name
    if (typeof value.goal === 'string' && Object.hasOwn(goalLabels, value.goal)) profile.goal = value.goal as UserProfile['goal']
    if (inRange(value.trainingDaysPerWeek, 0, 7)) profile.trainingDaysPerWeek = value.trainingDaysPerWeek
    return profile
  },
}

