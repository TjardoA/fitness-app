import { AppLayout } from './components/AppLayout'
import { useRoute } from './hooks/useRoute'
import { useAppData } from './hooks/useAppData'
import { useToday } from './hooks/useToday'
import { HomePage } from './pages/HomePage'
import { WorkoutPage } from './pages/WorkoutPage'
import { NutritionPage } from './pages/NutritionPage'
import { ProgressPage } from './pages/ProgressPage'
import { ProfilePage } from './pages/ProfilePage'
import { CoachPage } from './pages/CoachPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { AccountsPage } from './pages/AccountsPage'

export default function App() {
  const route = useRoute()
  const state = useAppData()
  const today = useToday()
  if (state.loading) return <main className="onboarding-shell"><p role="status">Opening your space…</p></main>
  if (!state.data) return <main className="onboarding-shell"><section className="card"><h1>Your data is unavailable</h1><p role="alert" className="muted my-5">{state.error}</p><button className="button button-primary" onClick={state.retry}>Retry</button></section></main>
  const { data, error, saving } = state
  const profile = data.profile
  if (!profile) return state.creatingAccount
    ? <OnboardingPage legacy={state.legacy} onSave={state.saveProfile} saving={saving} error={error} onCancel={state.accounts.length ? state.cancelCreate : undefined} />
    : <AccountsPage accounts={state.accounts} saving={saving} error={error} onSignIn={state.signIn} onCreate={state.createAccount} />
  const pages = {
    home: <HomePage data={data} profile={profile} today={today} />,
    workout: <WorkoutPage workouts={data.workouts} today={today} />,
    nutrition: <NutritionPage profile={profile} days={data.nutrition} today={today} actions={state} saving={saving} error={error} />,
    progress: <ProgressPage weights={data.weights} workouts={data.workouts} today={today} onAdd={state.addWeight} saving={saving} error={error} />,
    profile: <ProfilePage profile={profile} error={error} saving={saving} onSave={state.saveProfile} onSignOut={state.signOut} />,
    coach: <CoachPage />,
  }
  return <AppLayout key={profile.id} route={route}>{pages[route]}</AppLayout>
}
