import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import { PageHeading } from '../components/ui'
import { ProfileFields } from '../components/ProfileFields'
import { TargetFields } from '../components/TargetFields'
import { Recommendation } from '../components/Recommendation'
import { calculateRecommendation } from '../utils/nutrition'
import { parseProfile, parseTargets, profileDraft, targetsDraft } from '../utils/profileForm'
import type { UserProfile } from '../types/models'
import { newId } from '../utils/dates'

const steps = ['About you', 'Your activity', 'Your goal', 'Your nutrition']
interface Props {
  legacy: Partial<UserProfile> | null
  onSave: (profile: UserProfile) => Promise<boolean>
  saving: boolean
  error: string
  onCancel?: () => void
}
export function OnboardingPage({ legacy, onSave, saving, error, onCancel }: Props) {
  const [profileId] = useState(() => legacy?.id || newId())
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState(() => profileDraft(legacy))
  const [targets, setTargets] = useState(() => targetsDraft())
  const [formError, setFormError] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)
  // Placeholder targets only validate profile inputs here; they are never displayed or saved.
  const inputs = parseProfile(draft, { calories: 1, protein: 0, carbohydrates: 0, fat: 0 }, profileId)
  useEffect(() => { heading.current?.focus(); window.scrollTo(0, 0) }, [step])

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    if (step < 3) {
      if (step === 2) {
        if (!inputs) { setFormError('Check your details in the previous steps.'); return }
        setTargets(targetsDraft(calculateRecommendation(inputs).targets))
      }
      setStep(step + 1)
      return
    }
    const profile = parseProfile(draft, parseTargets(targets), profileId)
    if (!profile) { setFormError('Check your details and nutrition targets.'); return }
    if (await onSave(profile)) window.location.hash = '/home'
  }
  return <main className="onboarding-shell">
    <a className="brand mb-8" href="#/home"><span className="brand-mark">f.</span>forma</a>
    {onCancel && <button type="button" disabled={saving} className="text-button mb-4" onClick={onCancel}>← Back to accounts</button>}
    <PageHeading eyebrow="YOUR DAILY PRACTICE STARTS HERE" title="A space that fits you." description="A few details to make your training and nutrition personal." />
    {legacy && <p className="setup-banner">Welcome back. Complete your earlier profile to start tracking your own data.</p>}
    <ol className="onboarding-steps" aria-label="Setup progress">{steps.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined}><span>{index + 1}</span><small>{label}</small></li>)}</ol>
    <section className="card">
      <h2 ref={heading} tabIndex={-1} className="step-heading">Step {step + 1} · {steps[step]}</h2>
      <form onSubmit={submit} className="profile-form">
        <fieldset disabled={saving} className="profile-form">
          {step < 3 && <ProfileFields draft={draft} onChange={setDraft} section={(['personal', 'activity', 'goal'] as const)[step]} />}
          {step === 3 && inputs && <>
            <Recommendation profile={inputs} />
            <p className="muted text-sm">Review your recommended daily targets. Every value is editable before you save.</p>
            <TargetFields draft={targets} onChange={setTargets} />
            <button type="button" className="text-button" onClick={() => setTargets(targetsDraft(calculateRecommendation(inputs).targets))}>Reset to recommended</button>
          </>}
          <div className="form-actions">
            {step > 0 && <button type="button" className="button button-secondary" onClick={() => setStep(step - 1)}>Back</button>}
            <button className="button button-primary" type="submit">{saving ? 'Saving…' : step === 3 ? 'Save & start' : 'Continue'} <span aria-hidden="true">→</span></button>
          </div>
        </fieldset>
        {(error || formError) && <p role="alert" className="text-orange text-sm">{formError || error}</p>}
      </form>
    </section>
    <p className="muted text-xs mt-5">Saved on this device. You can change your profile and targets at any time.</p>
  </main>
}

