export type IconName = 'home' | 'workout' | 'nutrition' | 'progress' | 'profile' | 'arrow' | 'spark' | 'plus' | 'flame'
const paths: Record<IconName, string> = {
  home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  workout: 'm6 6 12 12M3 8l5-5M2 5l3-3m11 19 5-5m-2 6 3-3M5 10l5-5m4 14 5-5',
  nutrition: 'M12 21C2 18 2 7 7 7c2 0 3 1 5 1s3-1 5-1c5 0 5 11-5 14ZM12 8V3m0 3c0-3 3-4 6-3-1 3-3 4-6 3',
  progress: 'M4 3v17h17M7 14l4-5 4 3 6-7',
  profile: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  spark: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',
  plus: 'M12 5v14M5 12h14',
  flame: 'M13 3c1 5 6 6 6 11a7 7 0 0 1-14 0c0-3 2-5 4-7 0 4 2 4 2 4s3-4 2-8Z',
}
export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}
