import { useEffect, useRef, type ReactNode } from 'react'
import type { Route } from '../hooks/useRoute'
import { Icon, type IconName } from './Icon'

const navigation: { route: Route; label: string; icon: IconName }[] = [
  { route: 'home', label: 'Home', icon: 'home' },
  { route: 'workout', label: 'Workout', icon: 'workout' },
  { route: 'nutrition', label: 'Nutrition', icon: 'nutrition' },
  { route: 'progress', label: 'Progress', icon: 'progress' },
]
export function AppLayout({ route, children }: { route: Route; children: ReactNode }) {
  const main = useRef<HTMLElement>(null)
  useEffect(() => {
    document.title = `${route.charAt(0).toUpperCase() + route.slice(1)} · Forma`
    main.current?.focus({ preventScroll: true })
    window.scrollTo(0, 0)
  }, [route])
  return <div className="app-shell" data-theme={route}>
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); main.current?.focus() }}>Skip to content</a>
    <header className="app-header">
      <a href="#/home" className="brand" aria-label="Forma home">forma</a>
      <span className="header-caption">A little better. Every day.</span>
      <div className="flex items-center gap-4 ml-auto"><a className="coach-link" href="#/coach"><Icon name="spark" /><span>AI Coach</span><span className="tiny-badge">SOON</span></a><a className="avatar" href="#/profile" aria-label="Your profile" aria-current={route === 'profile' ? 'page' : undefined}><Icon name="profile" /></a></div>
    </header>
    <nav className="navigation" aria-label="Main navigation">{navigation.map(item => <a key={item.route} data-theme={item.route} href={`#/${item.route}`} aria-current={route === item.route ? 'page' : undefined}><Icon name={item.icon} /><span>{item.label}</span></a>)}<div className="nav-footer"><span className="status-dot" /> Your space. Your pace.</div></nav>
    <main id="main" ref={main} tabIndex={-1} className="main-content">{children}</main>
    <footer className="app-footer">Built around you.<span>FORMA / YOUR DAILY PRACTICE</span></footer>
  </div>
}
