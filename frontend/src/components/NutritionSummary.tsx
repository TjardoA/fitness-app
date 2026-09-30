import { Meter } from './ui'
import type { NutritionTargets } from '../types/models'

export function NutritionSummary({ consumed, targets }: { consumed: NutritionTargets; targets: NutritionTargets }) {
  return <div className="grid sm:grid-cols-2 gap-6">
    <Meter label="Calories" value={consumed.calories} target={targets.calories} unit="kcal" />
    <Meter label="Protein" value={consumed.protein} target={targets.protein} tone="purple" />
    <Meter label="Carbohydrates" value={consumed.carbohydrates} target={targets.carbohydrates} />
    <Meter label="Fat" value={consumed.fat} target={targets.fat} tone="orange" />
  </div>
}

