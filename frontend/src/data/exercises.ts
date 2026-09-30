import { muscleSubgroups, equipmentTypeLabels, movementLabels, type MuscleSubgroup, type EquipmentType, type MovementPattern, type ExerciseType } from './exerciseTaxonomy'
import { extraExercises } from './exerciseSeed'
import type { TargetMuscle, WorkoutPlan } from '../types/models'

const extraEquipmentLabels = {
  "selectorized-machine": "Other selectorized machine",
  "plate-loaded-machine": "Other plate loaded machine",
  "smith": "Smith machine",
  "band": "Resistance band",
  "kettlebell": "Kettlebell",
  "ez-bar": "EZ bar",
  "trap-bar": "Trap bar",
  "medicine-ball": "Medicine ball",
  "dip-station": "Dip station",
  "landmine": "Landmine attachment",
  "suspension": "Suspension trainer",
  "other": "Other equipment",
  "assisted-station": "Assisted pull-up / dip machine",
  "incline-chest-machine": "Incline chest press machine",
  "decline-chest-machine": "Decline chest press machine",
  "plate-chest": "Plate loaded chest press",
  "plate-incline": "Plate loaded incline chest press",
  "plate-row": "Plate loaded row",
  "iso-row": "Iso-lateral row",
  "high-row": "High row machine",
  "low-row": "Low row machine",
  "machine-row": "Row machine",
  "tbar-row": "Chest supported T-bar row",
  "pullover-machine": "Pullover machine",
  "back-extension": "Back extension bench",
  "shoulder-machine": "Shoulder press machine",
  "plate-shoulder": "Plate loaded shoulder press",
  "lateral-machine": "Lateral raise machine",
  "reverse-pec-deck": "Reverse pec deck",
  "preacher-bench": "Preacher bench",
  "preacher-machine": "Preacher curl machine",
  "dip-machine": "Seated dip machine",
  "triceps-machine": "Triceps extension machine",
  "hack-squat": "Hack squat machine",
  "pendulum-squat": "Pendulum squat machine",
  "horizontal-leg-press": "Horizontal leg press",
  "belt-squat": "Belt squat machine",
  "seated-leg-curl": "Seated leg curl machine",
  "standing-leg-curl": "Standing leg curl machine",
  "ghd": "Glute ham developer",
  "hip-thrust": "Hip thrust machine",
  "glute-kickback": "Glute kickback machine",
  "hip-abduction": "Hip abduction machine",
  "hip-adduction": "Hip adduction machine",
  "seated-calf": "Seated calf raise machine",
  "donkey-calf": "Donkey calf raise machine",
  "calf-press": "Calf press machine",
  "crunch-machine": "Ab crunch machine",
  "captains-chair": "Captain's chair",
  "ab-wheel": "Ab wheel",
  "wrist-roller": "Wrist roller",
  "step": "Step / box",
  "sissy-bench": "Sissy squat bench",
  "plate": "Weight plate",
  "sliders": "Exercise sliders",
  "neck-harness": "Neck harness"
} as const
export const equipmentLabels = {
  dumbbells: 'Dumbbells', barbell: 'Barbell & plates', bench: 'Adjustable bench', rack: 'Squat rack / bench rack',
  'dual-cables': 'Dual cable station', 'decline-bench': 'Decline bench', 'chest-press': 'Chest press machine',
  cables: 'Cable station', 'pullup-bar': 'Pull-up bar', 'lat-pulldown': 'Lat pulldown',
  'cable-row': 'Seated cable row', 'chest-fly': 'Chest fly machine', 'leg-press': 'Leg press',
  ...extraEquipmentLabels,
  'leg-extension': 'Leg extension', 'leg-curl': 'Leg curl', 'calf-raise': 'Calf raise machine',
} as const
export type Equipment = keyof typeof equipmentLabels
export const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Forearms', 'Other'] as const
export type MuscleGroup = typeof muscleGroups[number]
export interface CatalogExercise {
  id: string
  name: string
  primaryMuscle: TargetMuscle
  secondaryMuscles: TargetMuscle[]
  muscle: MuscleGroup
  equipment: Equipment[]
  chestFocus?: 'upper' | 'mid' | 'lower'
  armFocus?: 'biceps' | 'triceps'
  unit: 'reps' | 'sec'
  aliases: string[]
  muscleSubgroups: MuscleSubgroup[]
  equipmentTypes: EquipmentType[]
  exerciseType: ExerciseType
  movementPattern: MovementPattern
  unilateral: boolean
  instructions: string[]
  isCustom: boolean
  notes?: string
}
export type ExerciseSeed = Omit<CatalogExercise, 'aliases' | 'muscleSubgroups' | 'equipmentTypes' | 'exerciseType' | 'movementPattern' | 'unilateral' | 'instructions' | 'isCustom'> & Partial<CatalogExercise>
const originalExercises: ExerciseSeed[] = [
  { id: 'bench-press', primaryMuscle: 'chest', secondaryMuscles: ['front-delts', 'triceps'], chestFocus: 'mid', name: 'Barbell bench press', muscle: 'Chest', equipment: ['barbell', 'bench', 'rack'], unit: 'reps' },
  { id: 'dumbbell-press', primaryMuscle: 'chest', secondaryMuscles: ['front-delts', 'triceps'], chestFocus: 'mid', name: 'Dumbbell bench press', muscle: 'Chest', equipment: ['dumbbells', 'bench'], unit: 'reps' },
  { id: 'incline-press', primaryMuscle: 'chest', secondaryMuscles: ['front-delts', 'triceps'], chestFocus: 'upper', name: 'Incline dumbbell press', muscle: 'Chest', equipment: ['dumbbells', 'bench'], unit: 'reps' },
  { id: 'chest-fly', primaryMuscle: 'chest', secondaryMuscles: ['front-delts'], chestFocus: 'mid', name: 'Machine chest fly', muscle: 'Chest', equipment: ['chest-fly'], unit: 'reps' },
  { id: 'pushup', primaryMuscle: 'chest', secondaryMuscles: ['front-delts', 'triceps', 'core'], chestFocus: 'mid', name: 'Push-up', muscle: 'Chest', equipment: [], unit: 'reps' },
  { id: 'lat-pulldown', primaryMuscle: 'back', secondaryMuscles: ['biceps'], name: 'Lat pulldown', muscle: 'Back', equipment: ['lat-pulldown'], unit: 'reps' },
  { id: 'cable-row', primaryMuscle: 'back', secondaryMuscles: ['biceps', 'rear-delts'], name: 'Seated cable row', muscle: 'Back', equipment: ['cable-row'], unit: 'reps' },
  { id: 'dumbbell-row', primaryMuscle: 'back', secondaryMuscles: ['biceps', 'rear-delts'], name: 'One-arm dumbbell row', muscle: 'Back', equipment: ['dumbbells', 'bench'], unit: 'reps' },
  { id: 'pullup', primaryMuscle: 'back', secondaryMuscles: ['biceps'], name: 'Pull-up', muscle: 'Back', equipment: ['pullup-bar'], unit: 'reps' },
  { id: 'shoulder-press', aliases: ['seated dumbbell shoulder press'], primaryMuscle: 'front-delts', secondaryMuscles: ['side-delts', 'triceps'], name: 'Dumbbell shoulder press', muscle: 'Shoulders', equipment: ['dumbbells', 'bench'], unit: 'reps' },
  { id: 'lateral-raise', primaryMuscle: 'side-delts', secondaryMuscles: [], name: 'Lateral raise', muscle: 'Shoulders', equipment: ['dumbbells'], unit: 'reps' },
  { id: 'bicep-curl', primaryMuscle: 'biceps', secondaryMuscles: [], armFocus: 'biceps', name: 'Dumbbell biceps curl', muscle: 'Arms', equipment: ['dumbbells'], unit: 'reps' },
  { id: 'triceps-pushdown', primaryMuscle: 'triceps', secondaryMuscles: [], armFocus: 'triceps', name: 'Triceps rope pushdown', muscle: 'Arms', equipment: ['cables'], unit: 'reps' },
  { id: 'squat', primaryMuscle: 'quads', secondaryMuscles: ['glutes', 'hamstrings', 'core'], name: 'Barbell squat', muscle: 'Legs', equipment: ['barbell', 'rack'], unit: 'reps' },
  { id: 'leg-press', primaryMuscle: 'quads', secondaryMuscles: ['glutes'], name: 'Leg press', muscle: 'Legs', equipment: ['leg-press'], unit: 'reps' },
  { id: 'leg-extension', primaryMuscle: 'quads', secondaryMuscles: [], name: 'Leg extension', muscle: 'Legs', equipment: ['leg-extension'], unit: 'reps' },
  { id: 'leg-curl', primaryMuscle: 'hamstrings', secondaryMuscles: [], name: 'Lying leg curl', muscle: 'Legs', equipment: ['leg-curl'], unit: 'reps' },
  { id: 'rdl', primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes', 'back'], name: 'Romanian deadlift', muscle: 'Legs', equipment: ['barbell'], unit: 'reps' },
  { id: 'calf-raise', primaryMuscle: 'calves', secondaryMuscles: [], name: 'Standing calf raise', muscle: 'Legs', equipment: ['calf-raise'], unit: 'reps' },
  { id: 'plank', primaryMuscle: 'core', secondaryMuscles: [], name: 'Plank', muscle: 'Core', equipment: [], unit: 'sec' },
  { id: 'incline-barbell-press', primaryMuscle: 'chest', secondaryMuscles: ['front-delts', 'triceps'], name: 'Incline barbell press', muscle: 'Chest', chestFocus: 'upper', equipment: ['barbell', 'bench', 'rack'], unit: 'reps' },
  { id: 'decline-dumbbell-press', primaryMuscle: 'chest', secondaryMuscles: ['triceps', 'front-delts'], name: 'Decline dumbbell press', muscle: 'Chest', chestFocus: 'lower', equipment: ['dumbbells', 'decline-bench'], unit: 'reps' },
  { id: 'dumbbell-fly', primaryMuscle: 'chest', secondaryMuscles: ['front-delts'], name: 'Dumbbell chest fly', muscle: 'Chest', chestFocus: 'mid', equipment: ['dumbbells', 'bench'], unit: 'reps' },
  { id: 'incline-dumbbell-fly', primaryMuscle: 'chest', secondaryMuscles: ['front-delts'], name: 'Incline dumbbell fly', muscle: 'Chest', chestFocus: 'upper', equipment: ['dumbbells', 'bench'], unit: 'reps' },
  { id: 'cable-fly', primaryMuscle: 'chest', secondaryMuscles: ['front-delts'], name: 'Standing cable fly', muscle: 'Chest', chestFocus: 'mid', equipment: ['dual-cables'], unit: 'reps' },
  { id: 'low-high-fly', primaryMuscle: 'chest', secondaryMuscles: ['front-delts'], name: 'Low-to-high cable fly', muscle: 'Chest', chestFocus: 'upper', equipment: ['dual-cables'], unit: 'reps' },
  { id: 'high-low-fly', primaryMuscle: 'chest', secondaryMuscles: ['front-delts'], name: 'High-to-low cable fly', muscle: 'Chest', chestFocus: 'lower', equipment: ['dual-cables'], unit: 'reps' },
  { id: 'machine-chest-press', primaryMuscle: 'chest', secondaryMuscles: ['front-delts', 'triceps'], name: 'Machine chest press', muscle: 'Chest', chestFocus: 'mid', equipment: ['chest-press'], unit: 'reps' },
  { id: 'hammer-curl', primaryMuscle: 'biceps', secondaryMuscles: ['forearms'], muscleSubgroups: ['brachialis','brachioradialis'], name: 'Hammer curl', muscle: 'Arms', armFocus: 'biceps', equipment: ['dumbbells'], unit: 'reps' },
  { id: 'overhead-triceps', primaryMuscle: 'triceps', secondaryMuscles: [], name: 'Overhead dumbbell triceps extension', muscle: 'Arms', armFocus: 'triceps', equipment: ['dumbbells'], unit: 'reps' },
  { id: 'face-pull', primaryMuscle: 'rear-delts', secondaryMuscles: ['back'], name: 'Cable face pull', muscle: 'Shoulders', equipment: ['cables'], unit: 'reps' },
  { id: 'goblet-squat', primaryMuscle: 'quads', secondaryMuscles: ['glutes', 'core'], name: 'Goblet squat', muscle: 'Legs', equipment: ['dumbbells'], unit: 'reps' },
  { id: 'chest-supported-row', name: 'Chest supported dumbbell row', primaryMuscle: 'back', secondaryMuscles: ['biceps', 'rear-delts'], muscle: 'Back', equipment: ['dumbbells', 'bench'], unit: 'reps' },
  { id: 'rear-delt-fly', name: 'Dumbbell rear delt fly', primaryMuscle: 'rear-delts', secondaryMuscles: ['back'], muscle: 'Shoulders', equipment: ['dumbbells'], unit: 'reps' },
]
// The curated catalog and custom entries share one model. Workout prescriptions remain separate.
const gearTypes: Partial<Record<Equipment, EquipmentType>> = {
  'selectorized-machine':'selectorized','plate-loaded-machine':'plate-loaded',dumbbells:'dumbbell',barbell:'barbell',bench:'bench',rack:'barbell','decline-bench':'bench',cables:'cable','dual-cables':'cable','pullup-bar':'pullup-bar',
  smith:'smith',band:'band',kettlebell:'kettlebell','ez-bar':'ez-bar','trap-bar':'trap-bar','medicine-ball':'medicine-ball','dip-station':'dip-station',landmine:'landmine',suspension:'suspension',other:'other','assisted-station':'assisted',
  'plate-chest':'plate-loaded','plate-incline':'plate-loaded','plate-row':'plate-loaded','iso-row':'plate-loaded','plate-shoulder':'plate-loaded','leg-press':'plate-loaded','hack-squat':'plate-loaded','pendulum-squat':'plate-loaded','belt-squat':'plate-loaded','tbar-row':'plate-loaded',
  'back-extension':'other',ghd:'other','preacher-bench':'bench','captains-chair':'bodyweight','ab-wheel':'other','wrist-roller':'other',step:'other','sissy-bench':'other',plate:'other',sliders:'other','neck-harness':'other',
}
export function equipmentTypesFor(equipment: Equipment[]): EquipmentType[] {
  return equipment.length ? [...new Set(equipment.map(id => gearTypes[id] ?? 'selectorized'))] : ['bodyweight']
}
const movementCues: Record<MovementPattern,string[]> = {
  'horizontal-push':['Set a stable base and keep your wrists aligned with your forearms.','Press away under control, then return through a comfortable range.'],
  'vertical-push':['Brace your trunk and position the load near shoulder height.','Press overhead without leaning back; lower with control.'],
  'horizontal-pull':['Brace your torso and keep your shoulders relaxed.','Pull your elbows back, then return without swinging.'],
  'vertical-pull':['Set your grip and brace your torso.','Draw your elbows down towards your ribs; return with control.'],
  squat:['Keep your feet planted and brace your trunk.','Bend at knees and hips, then stand through your whole foot.'],
  hinge:['Brace your trunk and soften your knees.','Move your hips back, then extend your hips without arching your lower back.'],
  lunge:['Take a stable stance with space between your feet.','Lower under control, then drive through the working leg.'],
  curl:['Keep your upper arms steady.','Bend your elbows under control; avoid swinging the load.'],
  extension:['Stabilize the joints that are not moving.','Extend the working joint smoothly, then return with control.'],
  raise:['Start in a stable position with a comfortable range.','Lift under control and lower slowly without momentum.'],
  fly:['Keep a small, steady bend in the elbows.','Move your arms in an arc; avoid forcing the end of the range.'],
  carry:['Stand tall and brace with the load held securely.','Move with short controlled steps and keep your shoulders level.'],
  core:['Set a stable base and breathe while bracing your trunk.','Move or hold as intended without losing control of your pelvis.'],
  adduction:['Keep your pelvis and torso stable.','Bring the working limb towards your midline and return slowly.'],
  abduction:['Keep your pelvis and torso stable.','Move the working limb away from your midline and return slowly.'],
  rotation:['Brace your trunk and establish a stable stance.','Rotate through the intended range without jerking the load.'],
  other:['Set up the equipment to fit your body and establish a stable position.','Use a controlled, comfortable range and follow the equipment instructions.'],
}
function inferMovement(e: ExerciseSeed): MovementPattern {
  if (e.primaryMuscle==='core') return 'core'
  if (e.id.includes('fly')) return 'fly'
  if (e.id.includes('raise')) return 'raise'
  if (e.id.includes('curl')) return 'curl'
  if (e.primaryMuscle==='triceps' || e.id==='leg-extension') return 'extension'
  if (e.id==='rdl') return 'hinge'
  if (e.primaryMuscle==='quads') return 'squat'
  if (e.primaryMuscle==='back') return e.id.includes('row')?'horizontal-pull':'vertical-pull'
  if (e.primaryMuscle==='rear-delts') return 'horizontal-pull'
  if (e.primaryMuscle==='front-delts') return 'vertical-push'
  return 'horizontal-push'
}
export function completeExercise(e: ExerciseSeed): CatalogExercise {
  if (e.primaryMuscle === 'chest' && !e.chestFocus) e = {...e,chestFocus:'mid'}
  const movementPattern=e.movementPattern ?? inferMovement(e)
  const equipmentTypes=equipmentTypesFor(e.equipment)
  if (e.id.includes('assisted') && !equipmentTypes.includes('assisted')) equipmentTypes.push('assisted')
  const supportedBodyweight = /pullup|chinup|pushup|dip|inverted-row|dead-hang|back-extension|sit-up|hanging|captains|suspension|nordic|glute-ham/.test(e.id)
  if (supportedBodyweight && !equipmentTypes.some(type=>['barbell','dumbbell','cable','selectorized','plate-loaded','assisted'].includes(type)) && !equipmentTypes.includes('bodyweight')) equipmentTypes.push('bodyweight')
  if (e.equipment.includes('cable-row') && !equipmentTypes.includes('cable')) equipmentTypes.push('cable')
  const aliases=[...(e.aliases ?? []), ...(e.id==='lateral-raise'?['lat raise','dumbbell lateral raise']:[]), ...(e.id==='chest-fly'?['pec deck']:[]), ...(e.id==='triceps-pushdown'?['tricep pushdown','rope pushdown','tricep cable']:[]), ...(e.id==='rdl'?['barbell romanian deadlift']:[]), ...(e.id==='squat'?['back squat']:[])]
  const subgroups=e.muscleSubgroups ?? (e.primaryMuscle==='glutes' ? ['gluteus-maximus'] as MuscleSubgroup[] : e.primaryMuscle==='back' ? (e.id.includes('row')?['lats','upper-back','rhomboids','traps']:['lats']) as MuscleSubgroup[] : (Object.keys(muscleSubgroups) as MuscleSubgroup[]).filter(id=>muscleSubgroups[id].muscle===e.primaryMuscle && (e.primaryMuscle!=='chest' || !e.chestFocus || id===e.chestFocus+'-chest')))
  return {...e,aliases,muscleSubgroups:subgroups,equipmentTypes,exerciseType:e.exerciseType ?? (['curl','extension','raise','fly'].includes(movementPattern)?'isolation':'compound'),movementPattern,unilateral:e.unilateral ?? /single|one-arm/.test(e.name.toLowerCase()),instructions:e.instructions ?? (e.primaryMuscle==='hamstrings' && movementPattern==='curl' ? ['Align your knees with the machine pivot or establish a secure support.','Bend your knees under control while keeping your hips steady, then return slowly.'] : movementCues[movementPattern]),isCustom:e.isCustom ?? false}
}
export const exercises: CatalogExercise[] = [...originalExercises,...extraExercises].map(completeExercise)
export function catalogFor(custom: CatalogExercise[] = []) { return [...exercises,...custom] }
export function indexExercises(custom: CatalogExercise[] = []) { return new Map(catalogFor(custom).map(e=>[e.id,e])) }
export function normalizeSearch(text: string) { return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim() }
export function exerciseSearchText(e: CatalogExercise) {
  return normalizeSearch([e.name,...e.aliases,e.primaryMuscle,...e.secondaryMuscles,...e.muscleSubgroups.map(id=>muscleSubgroups[id].label),...e.equipment.map(id=>equipmentLabels[id]),...e.equipmentTypes.map(id=>equipmentTypeLabels[id]),movementLabels[e.movementPattern]].join(' '))
}
export function matchesSearch(e: CatalogExercise, query: string) { const text=exerciseSearchText(e); return normalizeSearch(query).split(' ').every(word=>text.includes(word)) }
export const chestFocusLabels = { upper: 'Upper chest', mid: 'Mid / overall chest', lower: 'Lower chest' } as const
export const chestFocusNotes = {
  upper: 'Incline presses and upward fly angles can emphasize the upper (clavicular) region.',
  mid: 'Flat presses and horizontal fly movements train the chest broadly, including the sternal region.',
  lower: 'Decline presses and downward fly angles are options for emphasizing the lower sternal region.',
} as const
export const exerciseById = new Map(exercises.map(exercise => [exercise.id, exercise]))
export const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export function emptyWorkoutPlan(): WorkoutPlan {
  return { id: 'weekly-plan', schemaVersion: 2, name: 'My training plan', templateId: null, customized: false, equipment: [], gymConfigured: false, favorites: [], days: weekdays.map((_, index) => ({ id: 'day-' + (index + 1), name: 'Rest', type: 'rest', targetMuscleGroups: [], exercises: [] })) }
}
export function availableAtGym(exercise: CatalogExercise, equipment: string[]) {
  return exercise.equipment.every(item => equipment.includes(item))
}
