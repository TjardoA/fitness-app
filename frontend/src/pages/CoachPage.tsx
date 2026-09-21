import { Icon } from '../components/Icon'
import { PageHeading } from '../components/ui'

export function CoachPage() {
  return <>
    <PageHeading eyebrow="AI COACH · COMING LATER" title="A little guidance." description="A future space to reflect, adjust and move forward." />
    <section className="card progress-empty"><span className="coach-emblem"><Icon name="spark" /></span><h2>Your routine. A more personal perspective.</h2><p className="muted">Your coach will connect your goals, training, nutrition and progress. For now, this is a preview; no AI is connected and no data is sent to an AI service.</p><div className="flex flex-wrap justify-center gap-3"><span className="pill">Understand my progress</span><span className="pill">Reflect on my week</span><span className="pill">Adjust my routine</span></div></section>
  </>
}
