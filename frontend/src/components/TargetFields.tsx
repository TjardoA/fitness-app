import { macroCalories } from '../utils/nutrition'
import { parseTargets, type TargetsDraft } from '../utils/profileForm'
import { validTargets } from '../utils/validation'

export function TargetFields({ draft, onChange }: { draft: TargetsDraft; onChange: (draft: TargetsDraft) => void }) {
  const targets = parseTargets(draft)
  const equivalent = validTargets(targets) ? macroCalories(targets) : null
  return <div>
    <div className="form-grid">{([
      ['calories', 'Calories (kcal)'], ['protein', 'Protein (g)'],
      ['carbohydrates', 'Carbohydrates (g)'], ['fat', 'Fat (g)'],
    ] as const).map(([key, label]) => <label key={key}>{label}<input required name={key} type="number" inputMode="decimal"
      min={key === 'calories' ? 1 : 0} max={key === 'calories' ? 20000 : 5000} step="0.1" value={draft[key]}
      onChange={event => onChange({ ...draft, [key]: event.target.value })} /></label>)}</div>
    {equivalent !== null && Math.abs(equivalent - targets.calories) > 50 && <p className="form-hint mt-3">
      These macros represent about {equivalent.toLocaleString('en-GB')} kcal. Your calorie target is independent; you can adjust either value.
    </p>}
  </div>
}

