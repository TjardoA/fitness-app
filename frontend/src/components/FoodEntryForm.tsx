import { useState, type SubmitEvent } from 'react'
import { mealLabels } from '../data/profileOptions'
import type { FoodEntry, MealType } from '../types/models'
import { newId } from '../utils/dates'
import { validFood } from '../utils/validation'

interface Props {
  entry?: FoodEntry
  meal: MealType
  saving: boolean
  onSave: (entry: FoodEntry) => Promise<boolean>
  onCancel: () => void
}
export function FoodEntryForm({ entry, meal, saving, onSave, onCancel }: Props) {
  const [error, setError] = useState('')
  // Stable ID makes retrying this entry safe.
  const [id] = useState(() => entry?.id ?? newId())
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const next: FoodEntry = {
      id, name: String(data.get('foodName')).trim(), serving: String(data.get('serving')).trim(),
      mealType: data.get('mealType') as MealType,
      calories: Number(data.get('calories')), protein: Number(data.get('protein')),
      carbohydrates: Number(data.get('carbohydrates')), fat: Number(data.get('fat')),
    }
    if (!validFood(next)) { setError('Check the food details. Nutrients cannot be negative.'); return }
    setError('')
    await onSave(next)
  }
  return <section className="card food-form-card">
    <h2 className="mb-2">{entry ? 'Edit food' : 'Add food'}</h2>
    <p className="muted text-sm mb-6">Enter nutrition for the entire amount you ate, not per 100 g. The serving description does not multiply these values.</p>
    <form onSubmit={submit} className="profile-form">
      <fieldset disabled={saving} className="profile-form">
        <div className="form-grid">
          <label>Food name<input autoFocus required name="foodName" maxLength={100} pattern=".*\S.*" defaultValue={entry?.name ?? ''} placeholder="e.g. Chicken breast" /></label>
          <label>Meal<select name="mealType" defaultValue={entry?.mealType ?? meal}>{Object.entries(mealLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="full-width">Amount / serving description<input required name="serving" maxLength={100} pattern=".*\S.*" defaultValue={entry?.serving ?? ''} placeholder="e.g. 200 g or 1 bowl" /></label>
          {([['calories', 'Calories (kcal)'], ['protein', 'Protein (g)'], ['carbohydrates', 'Carbohydrates (g)'], ['fat', 'Fat (g)']] as const).map(([key, label]) =>
            <label key={key}>{label}<input required type="number" inputMode="decimal" name={key} min={0} max={key === 'calories' ? 20000 : 5000} step="0.1" defaultValue={entry?.[key] ?? ''} /></label>)}
        </div>
        <div className="form-actions"><button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit">{saving ? 'Saving…' : entry ? 'Save changes' : 'Add food'}</button></div>
      </fieldset>
      {error && <p role="alert" className="text-orange text-sm">{error}</p>}
    </form>
  </section>
}

