import { useSyncExternalStore } from 'react'
export type Route = 'home' | 'workout' | 'nutrition' | 'progress' | 'profile' | 'coach'
const routes: Route[] = ['home', 'workout', 'nutrition', 'progress', 'profile', 'coach']
function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}
function getRoute(): Route {
  const path = window.location.hash.replace('#/', '')
  return routes.find(route => route === path) ?? 'home'
}
// Hash URLs support refresh and browser back without server route configuration.
export function useRoute() { return useSyncExternalStore(subscribe, getRoute) }
