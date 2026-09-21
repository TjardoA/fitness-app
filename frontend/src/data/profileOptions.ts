import type { ActivityLevel, FitnessGoal, MealType } from '../types/models'

export const activityOptions: Record<ActivityLevel, { label: string; description: string; multiplier: number }> = {
  sedentary: { label: 'Sedentary', description: 'Mostly seated, little exercise or walking.', multiplier: 1.2 },
  light: { label: 'Lightly active', description: 'Some walking and light exercise during the week.', multiplier: 1.375 },
  moderate: { label: 'Moderately active', description: 'Regular exercise and movement on most days.', multiplier: 1.55 },
  high: { label: 'Very active', description: 'A physically active job or frequent demanding exercise.', multiplier: 1.725 },
}
export const goalLabels: Record<FitnessGoal, string> = {
  'fat-loss': 'Fat loss', 'muscle-gain': 'Muscle gain',
  recomposition: 'Body recomposition', maintenance: 'Maintain weight',
}
export const goalDescriptions: Record<FitnessGoal, string> = {
  'fat-loss': 'Gradually reduce body weight with a modest calorie deficit.',
  'muscle-gain': 'Support muscle growth with training and a small calorie surplus.',
  recomposition: 'Build muscle while gradually reducing body fat. Your weight may stay similar as you get stronger.',
  maintenance: 'Support your routine while keeping your weight broadly stable.',
}
export const mealLabels: Record<MealType, string> = {
  breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks',
}

