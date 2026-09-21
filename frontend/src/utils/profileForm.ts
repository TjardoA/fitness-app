import type { NutritionTargets, UserProfile } from '../types/models'
import { validProfile } from './validation'

export interface ProfileDraft {
  name: string; age: string; sex: string; heightCm: string; weightKg: string
  activityLevel: string; trainingDaysPerWeek: string; goal: string
}
export type TargetsDraft = Record<keyof NutritionTargets, string>
export function profileDraft(profile?: Partial<UserProfile> | null): ProfileDraft {
  return {
    name: profile?.name ?? '', age: profile?.age?.toString() ?? '', sex: profile?.sex ?? '',
    heightCm: profile?.heightCm?.toString() ?? '', weightKg: profile?.weightKg?.toString() ?? '',
    activityLevel: profile?.activityLevel ?? '', trainingDaysPerWeek: profile?.trainingDaysPerWeek?.toString() ?? '',
    goal: profile?.goal ?? '',
  }
}
export function targetsDraft(targets?: NutritionTargets): TargetsDraft {
  return { calories: targets?.calories.toString() ?? '', protein: targets?.protein.toString() ?? '',
    carbohydrates: targets?.carbohydrates.toString() ?? '', fat: targets?.fat.toString() ?? '' }
}
export function parseTargets(draft: TargetsDraft): NutritionTargets {
  return { calories: draft.calories.trim() ? Number(draft.calories) : NaN,
    protein: draft.protein.trim() ? Number(draft.protein) : NaN,
    carbohydrates: draft.carbohydrates.trim() ? Number(draft.carbohydrates) : NaN,
    fat: draft.fat.trim() ? Number(draft.fat) : NaN }
}
export function parseProfile(draft: ProfileDraft, targets: NutritionTargets, id: string): UserProfile | null {
  const candidate = {
    id, name: draft.name.trim(), age: Number(draft.age), sex: draft.sex,
    heightCm: Number(draft.heightCm), weightKg: Number(draft.weightKg),
    activityLevel: draft.activityLevel, trainingDaysPerWeek: draft.trainingDaysPerWeek === '' ? NaN : Number(draft.trainingDaysPerWeek),
    goal: draft.goal, targets,
  }
  return validProfile(candidate) ? candidate : null
}

