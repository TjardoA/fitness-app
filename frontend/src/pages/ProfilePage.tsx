import { useState, type SubmitEvent } from 'react'
import { PageHeading } from '../components/ui'
import { ProfileFields } from '../components/ProfileFields'
import { TargetFields } from '../components/TargetFields'
import { Recommendation } from '../components/Recommendation'
import { calculateRecommendation } from '../utils/nutrition'
import { parseProfile, parseTargets, profileDraft, targetsDraft } from '../utils/profileForm'
import type { UserProfile } from '../types/models'

interface Props { profile: UserProfile; error: string; saving: boolean; onSave: (profile: UserProfile) => Promise<boolean>; onSignOut: () => Promise<boolean>; onDeleteAccount: () => Promise<boolean> }
export function ProfilePage({ profile, error, saving, onSave, onSignOut, onDeleteAccount }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [draft, setDraft] = useState(() => profileDraft(profile))
  const [targets, setTargets] = useState(() => targetsDraft(profile.targets))
  const [message, setMessage] = useState('')
  const candidate = parseProfile(draft, parseTargets(targets), profile.id)
  const inputs = parseProfile(draft, profile.targets, profile.id)
  const changedInputs = inputs && ['age', 'sex', 'heightCm', 'weightKg', 'activityLevel', 'goal'].some(key =>
    inputs[key as keyof UserProfile] !== profile[key as keyof UserProfile])
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!candidate) { setMessage('Check your details and targets.'); return }
    if (await onSave(candidate)) setMessage('Profile saved. Your history is preserved.')
  }
  return <>
    <PageHeading eyebrow="YOUR PROFILE" title="Make it personal." description="Your details, your goals, your choices."
      action={<div className="flex flex-col gap-2 shrink-0">
        <button type="button" className="button button-secondary" disabled={saving} onClick={() => void onSignOut()}>Sign out</button>
        <button type="button" className="button button-danger" disabled={saving} aria-expanded={confirmDelete} aria-controls="delete-account-confirm" onClick={() => setConfirmDelete(true)}>Delete account</button>
      </div>} />
    <p className="muted text-sm mb-5">Signing out keeps your saved data. You can then choose another local account or create a new one. Unsaved edits are not kept.</p>
    {confirmDelete && <section id="delete-account-confirm" className="delete-confirm max-w-3xl mb-5" aria-labelledby="delete-account-title">
      <h2 id="delete-account-title">Delete {profile.name}’s account?</h2>
      <p className="muted my-3">This permanently removes your profile, food entries, weight history and workouts from this browser. This cannot be undone. Other accounts are kept.</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="button button-secondary" disabled={saving} onClick={() => setConfirmDelete(false)}>Cancel</button>
        <button type="button" className="button button-danger" disabled={saving} onClick={() => void onDeleteAccount()}>{saving ? 'Deleting…' : 'Permanently delete account'}</button>
      </div>
    </section>}
    <form className="profile-form max-w-3xl" onSubmit={submit} onChange={() => setMessage('')}>
      <fieldset disabled={saving} className="profile-form">
        <section className="card"><h2 className="mb-6">Personal</h2><ProfileFields section="personal" draft={draft} onChange={setDraft} /><p className="muted text-xs mt-4">Changing your weight adds a new measurement for today. Existing weigh-ins stay unchanged.</p></section>
        <section className="card"><h2 className="mb-6">Your rhythm</h2><ProfileFields section="activity" draft={draft} onChange={setDraft} /></section>
        <section className="card"><ProfileFields section="goal" draft={draft} onChange={setDraft} /></section>
        <section className="card profile-form">
          <h2>Daily nutrition targets</h2>
          {changedInputs && <p className="setup-banner">Your details have changed. Your targets stay as entered unless you choose “Reset to recommended”.</p>}
          {inputs && <Recommendation profile={inputs} />}
          <TargetFields draft={targets} onChange={setTargets} />
          <button type="button" className="text-button" disabled={!inputs} onClick={() => {
            if (inputs) { setTargets(targetsDraft(calculateRecommendation(inputs).targets)); setMessage('Recommendations filled in. Save to apply them.') }
          }}>Reset to recommended</button>
          <p className="muted text-xs">Saving targets applies them to today and future days. Past nutrition targets stay unchanged.</p>
        </section>
        <button className="button button-primary" type="submit">{saving ? 'Saving…' : 'Save profile'} <span aria-hidden="true">→</span></button>
      </fieldset>
      <p role="status" className="text-sm text-accent">{message}</p>
      {error && <p role="alert" className="text-orange text-sm">{error}</p>}
    </form>
  </>
}

