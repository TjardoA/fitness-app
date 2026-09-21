import { activityOptions, goalDescriptions, goalLabels } from '../data/profileOptions'
import type { ProfileDraft } from '../utils/profileForm'

interface Props { draft: ProfileDraft; onChange: (draft: ProfileDraft) => void; section: 'personal' | 'activity' | 'goal' }
export function ProfileFields({ draft, onChange, section }: Props) {
  function change(key: keyof ProfileDraft, value: string) { onChange({ ...draft, [key]: value }) }
  if (section === 'personal') return <div className="form-grid">
    <label className="full-width">Your name<input required name="name" autoComplete="given-name" maxLength={60} pattern=".*\S.*" value={draft.name} onChange={event => change('name', event.target.value)} /></label>
    <label>Age<input required name="age" type="number" min={18} max={100} step={1} value={draft.age} onChange={event => change('age', event.target.value)} /><small className="muted">This estimator is for adults (18+).</small></label>
    <label>Sex for the formula<select required name="sex" value={draft.sex} onChange={event => change('sex', event.target.value)}><option value="">Choose…</option><option value="female">Female</option><option value="male">Male</option></select></label>
    <label>Height (cm)<input required name="heightCm" type="number" inputMode="decimal" min={100} max={250} step="0.1" value={draft.heightCm} onChange={event => change('heightCm', event.target.value)} /></label>
    <label>Current weight (kg)<input required name="weightKg" type="number" inputMode="decimal" min={30} max={350} step="0.1" value={draft.weightKg} onChange={event => change('weightKg', event.target.value)} /></label>
  </div>
  if (section === 'activity') return <div className="profile-form">
    <fieldset className="choice-list"><legend>Activity level</legend>
      {Object.entries(activityOptions).map(([value, option]) => <label className="choice" key={value}>
        <input required type="radio" name="activityLevel" value={value} checked={draft.activityLevel === value} onChange={() => change('activityLevel', value)} />
        <span><strong>{option.label}</strong><small>{option.description}</small></span>
      </label>)}
    </fieldset>
    <p className="form-hint">Choose your overall week, including exercise. Planned training days are not added again to your calorie estimate.</p>
    <label>Training days per week<select required name="trainingDaysPerWeek" value={draft.trainingDaysPerWeek} onChange={event => change('trainingDaysPerWeek', event.target.value)}>
      <option value="">Choose…</option>{[0, 1, 2, 3, 4, 5, 6, 7].map(day => <option key={day} value={day}>{day} {day === 1 ? 'day' : 'days'}</option>)}
    </select></label>
  </div>
  return <fieldset className="choice-list"><legend>Your fitness goal</legend>
    {Object.entries(goalLabels).map(([value, label]) => <label className="choice" key={value}>
      <input required type="radio" name="goal" value={value} checked={draft.goal === value} onChange={() => change('goal', value)} />
      <span><strong>{label}</strong><small>{goalDescriptions[value as keyof typeof goalDescriptions]}</small></span>
    </label>)}
  </fieldset>
}

