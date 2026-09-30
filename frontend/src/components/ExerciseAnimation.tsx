import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { exerciseMotions, type Point, type Pose } from '../data/exerciseMotion'
import type { CatalogExercise } from '../data/exercises'

function subscribeMotion(callback: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const path = (pose: Pose, joints: number[]) => joints.map((joint, index) => `${index ? 'L' : 'M'}${pose[joint].join(' ')}`).join(' ')

export function ExerciseAnimation({ exercise, paused = false }: { exercise: CatalogExercise; paused?: boolean }) {
  if (!exerciseMotions[exercise.id]) return <div className="exercise-preview-placeholder" role="img" aria-label={exercise.name + ': movement preview unavailable'}><svg viewBox="0 0 300 215" aria-hidden="true"><ellipse cx="150" cy="199" rx="48" ry="5" fill="#0c1b2d"/><circle cx="150" cy="44" r="16" fill="#d5e4ee"/><path d="M150 68V125M150 78L118 117M150 78L182 117M150 125L128 185M150 125L172 185" fill="none" stroke="#aac9e8" strokeWidth="14" strokeLinecap="round"/></svg><small>No movement preview yet</small></div>
  return <AnimatedExercise exercise={exercise} paused={paused}/>
}
function AnimatedExercise({ exercise, paused = false }: { exercise: CatalogExercise; paused?: boolean }) {
  const svg = useRef<SVGSVGElement>(null)
  const [visible, setVisible] = useState(false)
  const reduced = useSyncExternalStore(subscribeMotion, reducedMotion, () => true)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting))
    if (svg.current) observer.observe(svg.current)
    return () => observer.disconnect()
  }, [])
  const motion = exerciseMotions[exercise.id]
  const moving = visible && !paused && !reduced && motion.from !== motion.to
  const { from, to, apparatus, load } = motion
  function animate(attributeName: string, start: string | number, end: string | number) {
    return moving && <animate attributeName={attributeName} values={`${start};${end};${start}`} dur="3.6s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines=".42 0 .58 1;.42 0 .58 1" />
  }
  function limb(joints: number[], color: string, width: number) {
    return <path d={path(from, joints)} stroke={color} strokeWidth={width}>{animate('d', path(from, joints), path(to, joints))}</path>
  }
  function mechanism(start: string, end: string, color: string, width: number) {
    return <path d={start} stroke={color} strokeWidth={width}>{animate('d', start, end)}</path>
  }
  function attachment(a: Point, b: Point, barbell = false) {
    return <g transform={`translate(${a.join(' ')})`}>
      {moving && <animateTransform attributeName="transform" type="translate" values={`${a.join(' ')};${b.join(' ')};${a.join(' ')}`} dur="3.6s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines=".42 0 .58 1;.42 0 .58 1" />}
      <g transform={motion.neutralGrip ? 'rotate(90)' : undefined}>
      <path d={barbell ? 'M-49 0H49' : 'M-13 0H13'} stroke="#adc7dd" strokeWidth="4" />
      {[-1,1].map(sign => <rect key={sign} x={sign * (barbell ? 38 : 13) - 4} y={barbell ? -14 : -8} width="8" height={barbell ? 28 : 16} rx="3" fill="#617d9b" stroke="#bfd2e1" strokeWidth="1.5" />)}
      </g>
    </g>
  }
  const torsoColor = exercise.muscle === 'Chest' || exercise.muscle === 'Back' || exercise.muscle === 'Core' ? '#b5d5ff' : '#c9d5df'
  const armColor = exercise.muscle === 'Arms' || exercise.muscle === 'Shoulders' ? '#93bcff' : '#d6dfe5'
  const legColor = exercise.muscle === 'Legs' ? '#a9caff' : '#bbcbd9'
  return <svg ref={svg} viewBox="0 -10 300 235" className="exercise-animation" role="img" aria-label={`${exercise.name}: animated exercise figure`} data-moving={moving} data-apparatus={apparatus}>
    <ellipse cx="150" cy="208" rx="100" ry="8" fill="#0c1b2d" />
    <path d="M28 208H273M54 202L247 202" stroke="#2b4560" strokeWidth="1" />
    <g fill="none" stroke="#476783" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
      {(apparatus === 'bench' || apparatus === 'curl') && <path d="M73 151H193M91 153V197M179 153V197M77 199H103M167 199H191" />}
      {apparatus === 'incline' && <path d="M108 106L153 152H189M147 156V197M177 156V197" />}
      {apparatus === 'decline' && <path d="M67 164L185 136H215M93 161V199M182 140V199M214 135L229 161" />}
      {(apparatus === 'seat' || apparatus === 'pulldown' || apparatus === 'fly' || apparatus === 'extension') && <path d="M134 97V148H174M153 150V197M130 200H179" />}
      {(apparatus === 'pulldown' || apparatus === 'bar' || apparatus === 'fly') && <path d="M74 201V18H226V201" />}
      {apparatus === 'row' && <path d="M107 163H165M127 165V199M251 200V89M236 185L247 169" />}
      {apparatus === 'press' && <path d="M91 127L131 183H160M133 185V201M165 200L251 67M203 201L273 91" />}
      {apparatus === 'extension' && <path d="M144 153L163 196H194" />}
      {exercise.id === 'calf-raise' && <path d="M111 201H189" />}
      {(apparatus === 'fly' || apparatus === 'chest-press') && <g data-part="machine-frame">
        <path d="M126 88V142H178M145 141V199M111 199H190M231 43V183H256V43Z" />
        <path d="M135 93V132" stroke="#365978" strokeWidth="25" />
        <path d="M131 144H177" stroke="#365978" strokeWidth="12" />
        {[65,80,95,110,125,140,155,170].map(y => <path key={y} d={`M236 ${y}H251`} stroke="#7892a7" strokeWidth="5" />)}
        <path d="M150 18H243V43" stroke="#7892a7" strokeWidth="2" />
      </g>}
      {apparatus === 'cables' && <g><path d="M42 198V15M258 198V15M42 15H258M26 200H62M238 200H274" /><path d="M32 63V157H51V63ZM249 63V157H268V63Z" strokeWidth="4" /></g>}
      {apparatus === 'calf' && <path d="M91 198V27H211V198M127 60H173" />}
      {['bench-press','incline-barbell-press'].includes(exercise.id) && <path d="M64 195V70H81M146 195V70H129" strokeWidth="5" />}
    </g>
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {(apparatus === 'fly' || apparatus === 'chest-press') && <g data-part="moving-machine-arms">{([4,6] as const).map((joint,index) => <g key={joint}>
        {mechanism(`M${index ? 197 : 103} 25L${from[joint][0]} ${from[joint][1]-7}`, `M${index ? 197 : 103} 25L${to[joint][0]} ${to[joint][1]-7}`, '#6d8dab', 7)}
        {mechanism(`M${from[joint][0]} ${from[joint][1]-10}L${from[joint][0]} ${from[joint][1]+24}`, `M${to[joint][0]} ${to[joint][1]-10}L${to[joint][0]} ${to[joint][1]+24}`, '#375a7b', 17)}
        {mechanism(`M${from[joint][0]-5} ${from[joint][1]-9}H${from[joint][0]+5}`, `M${to[joint][0]-5} ${to[joint][1]-9}H${to[joint][0]+5}`, '#d0dfeb', 5)}
        <circle cx={index ? 197 : 103} cy="25" r="6" fill="#a3bace" />
      </g>)}</g>}
      {motion.cableAnchors && <g data-part="cables">{motion.cableAnchors.map((anchor,index) => {
        const joint = index ? 6 : 4
        return <g key={index}><circle cx={anchor[0]} cy={anchor[1]} r="7" stroke="#98b5ce" strokeWidth="3" fill="#18324b" />{mechanism(`M${anchor.join(' ')}L${from[joint].join(' ')}`, `M${anchor.join(' ')}L${to[joint].join(' ')}`, '#b0c4d6', 2)}</g>
      })}</g>}
      {apparatus === 'press' && <g data-part="footplate">{mechanism(`M${from[8][0]-12} ${from[8][1]-10}L${from[10][0]+12} ${from[10][1]+10}`, `M${to[8][0]-12} ${to[8][1]-10}L${to[10][0]+12} ${to[10][1]+10}`, '#7696af', 10)}</g>}
      {(apparatus === 'extension' || apparatus === 'curl') && <g data-part="leg-roller">{mechanism(`M170 153L${from[10].join(' ')}`, `M170 153L${to[10].join(' ')}`, '#577a99', 7)}{mechanism(`M${from[8][0]-8} ${from[8][1]}L${from[10][0]+8} ${from[10][1]}`, `M${to[8][0]-8} ${to[8][1]}L${to[10][0]+8} ${to[10][1]}`, '#426785', 15)}</g>}
      {apparatus === 'pulldown' && <path d={`M150 18L${from[4].join(' ')}`} stroke="#7191ad" strokeWidth="2">{animate('d', `M150 18L${from[4].join(' ')}`, `M150 18L${to[4].join(' ')}`)}</path>}
      {load === 'cable' && apparatus === 'row' && <path d={`M251 110L${from[4].join(' ')}`} stroke="#7191ad" strokeWidth="2">{animate('d', `M251 110L${from[4].join(' ')}`, `M251 110L${to[4].join(' ')}`)}</path>}
      {limb([2,9,10], '#738ba3', 12)}
      {limb([1,5,6], '#829db5', 10)}
      {limb([1,2], '#8197aa', 27)}
      {limb([1,2], torsoColor, 19)}
      {limb([2,7,8], legColor, 13)}
      {limb([1,3,4], armColor, 11)}
      {limb([0,1], '#c9d5df', 10)}
      {[1,2,3,4,5,6,7,8,9,10].map(joint => <circle key={joint} cx={from[joint][0]} cy={from[joint][1]} r={joint === 2 ? 8 : 5} fill="#a9bfd0" stroke="#dce8ef" strokeWidth="1">{animate('cx', from[joint][0], to[joint][0])}{animate('cy', from[joint][1], to[joint][1])}</circle>)}
      <ellipse cx={from[0][0]} cy={from[0][1]} rx="12" ry="15" fill="#e5ebed" stroke="#bdcfdc" strokeWidth="2">{animate('cx', from[0][0], to[0][0])}{animate('cy', from[0][1], to[0][1])}</ellipse>
      {load === 'dumbbells' && !motion.singleLoad && attachment(from[4], to[4])}
      {load === 'dumbbells' && !motion.singleLoad && exercise.id !== 'dumbbell-row' && attachment(from[6], to[6])}
      {load === 'dumbbells' && motion.singleLoad && attachment([(from[4][0]+from[6][0])/2,(from[4][1]+from[6][1])/2],[(to[4][0]+to[6][0])/2,(to[4][1]+to[6][1])/2])}
      {load === 'barbell' && attachment([(from[4][0]+from[6][0])/2,(from[4][1]+from[6][1])/2],[(to[4][0]+to[6][0])/2,(to[4][1]+to[6][1])/2],true)}
      {apparatus === 'pulldown' && load !== 'cable' && <path d={`M${from[4].join(' ')}L${from[6].join(' ')}`} stroke="#abc4da" strokeWidth="5">{animate('d',`M${from[4].join(' ')}L${from[6].join(' ')}`,`M${to[4].join(' ')}L${to[6].join(' ')}`)}</path>}
    </g>
  </svg>
}
