import { useState } from 'react'
import { EmptyState, PageHeading } from '../components/ui'
import { NutritionSummary } from '../components/NutritionSummary'
import { FoodEntryForm } from '../components/FoodEntryForm'
import { mealLabels } from '../data/profileOptions'
import { totalNutrition } from '../utils/nutrition'
import { formatDate } from '../utils/dates'
import type { FoodEntry, MealType, NutritionDay, UserProfile } from '../types/models'
import type { AppActions } from '../hooks/useAppData'

interface Props { profile: UserProfile; days: NutritionDay[]; today: string; actions: AppActions; saving: boolean; error: string }
export function NutritionPage({ profile, days, today, actions, saving, error }: Props) {
  const [selection, setSelection] = useState('today')
  const date = selection === 'today' ? today : selection
  const [editor, setEditor] = useState<{ entry?: FoodEntry; meal: MealType } | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const day = days.find(item => item.date === date)
  const targets = day?.targets ?? profile.targets
  const entries = day?.entries ?? []
  const consumed = totalNutrition(entries)
  function selectDate(value: string) {
    setSelection(value === today || !value ? 'today' : value)
    setEditor(null); setDeleting(null); setMessage('')
  }
  async function save(entry: FoodEntry) {
    const success = await actions.saveFood(date, targets, entry)
    if (success) { setEditor(null); setMessage('Food saved. Your daily totals are updated.') }
    return success
  }
  return <>
    <PageHeading eyebrow="NUTRITION" title="Fuel your everyday." description="Your food, your targets, one day at a time." />
    <div className="date-toolbar profile-form">
      <label>Food diary date<input aria-label="Food diary date" type="date" required max={today} value={date} disabled={saving} onChange={event => selectDate(event.target.value)} /></label>
      {date !== today && <button className="text-button" onClick={() => selectDate(today)}>Back to today</button>}
    </div>
    <section className="card"><h2 className="mb-6">{date === today ? 'Today’s balance' : formatDate(date)}</h2><NutritionSummary consumed={consumed} targets={targets} />
      {date !== today && <p className="muted text-xs mt-5">{day ? 'Targets saved for this day.' : 'No entries for this date. Your current targets will be used if you add food.'}</p>}
    </section>
    <p role="status" className="text-lime text-sm mt-4">{message}</p>
    {error && <p role="alert" className="text-orange text-sm mt-4">{error}</p>}
    {editor && <div className="mt-5"><FoodEntryForm key={date + (editor.entry?.id ?? editor.meal)} entry={editor.entry} meal={editor.meal} saving={saving} onSave={save} onCancel={() => setEditor(null)} /></div>}
    {!entries.length && <EmptyState title="No meals logged yet"><p>Add your first food to start this day. Nothing is pre-filled for you.</p></EmptyState>}
    <div className="grid lg:grid-cols-2 gap-4 mt-5">
      {(Object.entries(mealLabels) as [MealType, string][]).map(([meal, label]) => {
        const foods = entries.filter(entry => entry.mealType === meal)
        return <section className="card" key={meal}>
          <div className="section-heading"><h2>{label}</h2><button disabled={saving} className="text-button" onClick={() => { setEditor({ meal }); setMessage('') }} aria-label={`Add food to ${label}`}>+ Add food</button></div>
          {!foods.length && <p className="muted text-sm mt-4">Nothing logged for {label.toLowerCase()}.</p>}
          <ul className="food-list">{foods.map(food => <li key={food.id}>
            <div className="flex justify-between gap-3"><div><h3>{food.name}</h3><p className="muted text-xs">{food.serving}</p></div><strong className="text-sm whitespace-nowrap">{food.calories} kcal</strong></div>
            <p className="muted text-xs mt-2">P {food.protein} g · C {food.carbohydrates} g · F {food.fat} g</p>
            <div className="entry-actions">
              <button disabled={saving} className="text-button" onClick={() => setEditor({ entry: food, meal })} aria-label={`Edit ${food.name}`}>Edit</button>
              <button disabled={saving} className="text-button text-orange" onClick={() => setDeleting(food.id)} aria-label={`Delete ${food.name}`}>Delete</button>
            </div>
            {deleting === food.id && <div className="delete-confirm"><p>Delete {food.name} from this day?</p><button disabled={saving} className="text-button" onClick={() => setDeleting(null)}>Keep entry</button><button disabled={saving} className="text-button text-orange" onClick={async () => {
              if (await actions.deleteFood(date, food.id)) {
                setDeleting(null)
                if (editor?.entry?.id === food.id) setEditor(null)
                setMessage('Food deleted. Your totals are updated.')
              }
            }}>Confirm delete</button></div>}
          </li>)}</ul>
          {!!foods.length && <p className="muted text-xs mt-4">Meal total · {totalNutrition(foods).calories} kcal</p>}
        </section>
      })}
    </div>
    <section className="card mt-5"><h2>Food diary history</h2>
      {days.length ? <div className="history-days">{[...days].sort((a, b) => b.date.localeCompare(a.date)).map(item => <button className="button button-secondary" disabled={saving} key={item.id} onClick={() => selectDate(item.date)}>{formatDate(item.date)} <span>{totalNutrition(item.entries).calories} kcal</span></button>)}</div> : <p className="muted text-sm mt-3">Your logged days will appear here.</p>}
    </section>
  </>
}

