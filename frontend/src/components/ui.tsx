import type { ReactNode } from 'react'
export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="muted">{description}</p></div>{action}</div>
}
export function Meter({ label, value, target, unit = 'g', tone = 'lime' }: { label: string; value: number; target: number; unit?: string; tone?: 'lime' | 'purple' | 'orange' }) {
  const difference = Math.round((target - value) * 10) / 10
  return <div className={`meter tone-${tone}`}>
    <div className="meter-label"><span>{label}</span><span><strong>{value.toLocaleString('en-GB')}</strong><span className="muted"> / {target.toLocaleString('en-GB')} {unit}</span></span></div>
    <progress aria-label={label} aria-valuetext={`${value} of ${target} ${unit}`} value={Math.min(value, target || 1)} max={target || 1} />
    <p className="muted text-xs">{Math.abs(difference).toLocaleString('en-GB')} {unit} {difference < 0 ? 'over target' : 'remaining'}</p>
  </div>
}
export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <div className="empty-state"><h3>{title}</h3><div className="muted text-sm mt-2">{children}</div></div>
}

