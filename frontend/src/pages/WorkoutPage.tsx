import { CustomExerciseEditor } from '../components/CustomExerciseEditor'
import { equipmentTypeLabels, exerciseTypeLabels, movementLabels, muscleSubgroups, type EquipmentType, type ExerciseType, type MovementPattern, type MuscleSubgroup } from '../data/exerciseTaxonomy'
import { useEffect, useMemo, useRef, useState, type SubmitEvent } from 'react'
import { Icon } from '../components/Icon'
import { PageHeading } from '../components/ui'
import { ExerciseDetails } from '../components/ExerciseDetails'
import { ExerciseAnimation } from '../components/ExerciseAnimation'
import { availableAtGym, chestFocusLabels, chestFocusNotes, equipmentLabels, catalogFor, indexExercises, exerciseSearchText, normalizeSearch, muscleGroups, weekdays, type CatalogExercise } from '../data/exercises'
import { applySplit, createTrainingDay, focusLabels, focusTargets, getDayFocus, matchesDay, movePlanDay, targetMuscleLabels, trainingSplits, updatePlanDay } from '../data/trainingSplits'
import type { TargetMuscle, TrainingDay, TrainingFocus, WorkoutPlan } from '../types/models'

interface Props { customExercises: CatalogExercise[]; plan: WorkoutPlan; today: string; saving: boolean; error: string; onSave: (plan: WorkoutPlan, customExercises: CatalogExercise[]) => Promise<boolean> }
export function WorkoutPage({ customExercises, plan, today, saving, error, onSave }: Props) {
  const [draft, setDraft] = useState(plan)
  const [custom, setCustom] = useState(customExercises)
  const [editingCustom,setEditingCustom] = useState<CatalogExercise | 'new' | null>(null)
  const [equipmentFilter,setEquipmentFilter] = useState<EquipmentType | ''>('')
  const [subgroup,setSubgroup] = useState<MuscleSubgroup | ''>('')
  const [typeFilter,setTypeFilter] = useState<ExerciseType | ''>('')
  const [movementFilter,setMovementFilter] = useState<MovementPattern | ''>('')
  const [customOnly,setCustomOnly] = useState(false)
  const [page,setPage] = useState({key:'',count:24})
  const exercises = useMemo(()=>catalogFor(custom),[custom])
  const exerciseById = useMemo(()=>indexExercises(custom),[custom])
  const searchIndex = useMemo(()=>new Map(exercises.map(e=>[e.id,exerciseSearchText(e)])),[exercises])
  const [dayIndex, setDayIndex] = useState(() => (new Date(today + 'T12:00:00').getDay() + 6) % 7)
  const [query, setQuery] = useState('')
  const [muscle, setMuscle] = useState('All')
  const [chestFocus, setChestFocus] = useState<'all' | keyof typeof chestFocusLabels>('all')
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [onlyGym, setOnlyGym] = useState(plan.gymConfigured)
  const [details, setDetails] = useState<CatalogExercise | null>(null)
  const [message, setMessage] = useState('')
  const [onlyFocus, setOnlyFocus] = useState(true)
  const [libraryOpen,setLibraryOpen] = useState(false)
  const [showTemplates,setShowTemplates] = useState(!plan.days.some(day=>day.type==='workout'))
  const [pendingTemplate, setPendingTemplate] = useState<string | null>(null)
  const [confirmRest, setConfirmRest] = useState(false)
  const [replacing, setReplacing] = useState<string | null>(null)
  const library = useRef<HTMLElement>(null)
  const day = draft.days[dayIndex]
  const focus = getDayFocus(day)
  const dirty = JSON.stringify(draft) !== JSON.stringify(plan) || JSON.stringify(custom) !== JSON.stringify(customExercises)
  const trainingDays = draft.days.filter(item => item.type === 'workout').length
  const visible = exercises.filter(exercise =>
    (chestFocus === 'all' || exercise.chestFocus === chestFocus) &&
    (day.type === 'workout' && (!onlyFocus || matchesDay(exercise, day))) &&
    (muscle === 'All' || exercise.muscle === muscle || exercise.primaryMuscle === muscle || exercise.secondaryMuscles.includes(muscle as TargetMuscle)) &&
    (!subgroup || exercise.muscleSubgroups.includes(subgroup)) &&
    (!equipmentFilter || exercise.equipmentTypes.includes(equipmentFilter)) &&
    (!typeFilter || exercise.exerciseType === typeFilter) &&
    (!movementFilter || exercise.movementPattern === movementFilter) &&
    (!customOnly || exercise.isCustom) &&
    (!onlyFavorites || draft.favorites.includes(exercise.id)) &&
    (!onlyGym || availableAtGym(exercise, draft.equipment)) &&
    normalizeSearch(query).split(' ').every(word=>searchIndex.get(exercise.id)!.includes(word)))
  const filterKey = JSON.stringify([day.id,day.targetMuscleGroups,query,muscle,subgroup,equipmentFilter,typeFilter,movementFilter,customOnly,chestFocus,onlyFocus,onlyGym,onlyFavorites])
  const visibleCount = page.key === filterKey ? page.count : 24
  const shown = visible.slice(0,visibleCount)
  function clearLibraryFilters() { setQuery(''); setMuscle('All'); setChestFocus('all'); setSubgroup(''); setEquipmentFilter(''); setTypeFilter(''); setMovementFilter(''); setOnlyFocus(false); setOnlyGym(false); setOnlyFavorites(false); setCustomOnly(false) }
  function revealLibrary() { setLibraryOpen(true); requestAnimationFrame(()=>{library.current?.scrollIntoView({block:'start'});library.current?.focus({preventScroll:true})}) }
  function openFullLibrary() { clearLibraryFilters(); revealLibrary() }
  function saveCustom(exercise: CatalogExercise) {
    setCustom([...custom.filter(item=>item.id!==exercise.id),exercise]); setEditingCustom(null); revealLibrary(); clearLibraryFilters(); setQuery(exercise.name)
    setMessage('Custom exercise ready. Save your plan to keep it in this account.')
  }


  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function change(next: WorkoutPlan) { setDraft(next); setMessage('') }
  function chooseDay(index: number) { setReplacing(null); setConfirmRest(false); setDayIndex(index); setMuscle('All'); setChestFocus('all'); setQuery(''); setOnlyFocus(true); setSubgroup(''); setEquipmentFilter(''); setTypeFilter(''); setMovementFilter(''); setCustomOnly(false) }
  function loadTemplate(id: string) {
    change(applySplit(draft, id)); chooseDay(0); setPendingTemplate(null); setShowTemplates(false)
    setMessage('Template loaded. Edit it freely, then save.')
  }
  function chooseSplit(id: string) {
    if (draft.days.some(item => item.exercises.length)) setPendingTemplate(id)
    else loadTemplate(id)
  }
  function updateDay(next: TrainingDay) { change(updatePlanDay(draft, next)) }
  function addTrainingDay() {
    const index = day.type === 'rest' ? dayIndex : draft.days.findIndex(item => item.type === 'rest')
    if (index < 0) return
    const slot = draft.days[index]
    change(updatePlanDay(draft, createTrainingDay(slot.id, 'all'))); chooseDay(index)
  }
  function makeRest() {
    updateDay(createTrainingDay(day.id, 'rest')); setConfirmRest(false); setReplacing(null)
  }
  function moveDay(direction: number) {
    const target = dayIndex + direction
    if (target < 0 || target > 6) return
    change(movePlanDay(draft, dayIndex, target)); chooseDay(target)
  }
  function add(exercise: CatalogExercise) {
    if (day.type === 'rest' || day.exercises.some(item => item.exerciseId === exercise.id) || (!replacing && day.exercises.length >= 20)) return
    if (replacing) {
      updateDay({ ...day, exercises: day.exercises.map(item => item.exerciseId === replacing ? {
        ...item, exerciseId: exercise.id, weightKg: null,
        repsMax: exerciseById.get(item.exerciseId)?.unit === exercise.unit ? item.repsMax : undefined,
        reps: exerciseById.get(item.exerciseId)?.unit === exercise.unit ? item.reps : exercise.unit === 'sec' ? 30 : 10,
      } : item) })
      setReplacing(null); setMessage('Exercise replaced. Weight is unset so you can choose the load for this exercise.')
    } else {
      updateDay({ ...day, exercises: [...day.exercises, { exerciseId: exercise.id, sets: 3, reps: exercise.unit === 'sec' ? 30 : 10, weightKg: null, restSeconds: 90 }] })
      setMessage(exercise.name + ' added to ' + day.name + '. Save your plan to keep it.')
    }
  }
  function favorite(id: string) {
    change({ ...draft, favorites: draft.favorites.includes(id) ? draft.favorites.filter(item => item !== id) : [...draft.favorites, id] })
  }
  function move(index: number, direction: number) {
    const next = [...day.exercises]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    updateDay({ ...day, exercises: next })
  }
  async function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (await onSave(draft, custom)) setMessage('Your plan, favorites and gym equipment are saved.')
  }
  return <>
    <PageHeading eyebrow="YOUR TRAINING SPACE" title="Your week. Your workout." description="Pick the moves you enjoy. Build a routine that feels like you." />
    <form id="workout-plan-form" onSubmit={save}>
      <fieldset disabled={saving} className="workout-planner">
        <details className="card split-picker" open={showTemplates} onToggle={event=>setShowTemplates(event.currentTarget.open)}><summary className="split-summary"><span>{draft.name}</span><span className="muted text-xs">Choose template</span></summary>
          <div className="planner-heading"><div><p className="eyebrow">01 / YOUR TRAINING STYLE</p><h2 id="split-title">Start with your split.</h2></div><span className="pill">YOUR ROUTINE</span></div>
          <p className="muted text-sm mb-5">Choose a template with editable example workouts, or build your own week.</p>
          <div className="split-options" role="group" aria-label="Training split">{trainingSplits.map(split => <button key={split.id} type="button" data-split={split.id} aria-pressed={draft.templateId === split.id} onClick={() => chooseSplit(split.id)}><span className="split-option-mark" aria-hidden="true">{draft.templateId === split.id ? '✓' : <Icon name="workout" />}</span><strong>{split.name}</strong><small>{split.recommendedDaysPerWeek} training days / {split.description}</small></button>)}<button type="button" data-split="custom" aria-pressed={draft.templateId === null} onClick={() => chooseSplit('custom')}><span className="split-option-mark"><Icon name="plus" /></span><strong>Create your own plan</strong><small>Start with an empty week. Add your own training days.</small></button></div>
          <p className="muted text-xs mt-4">Templates are starting points. Change exercises, muscles, days and rest days to make the plan yours.</p>
        </details>
        {pendingTemplate && <section className="delete-confirm" role="alert"><h2>Replace this training plan?</h2><p className="muted my-3">The selected template replaces the days and exercises in this editor. Your gym and favorites stay. Your saved plan changes only when you save.</p><button type="button" className="button button-secondary" onClick={() => setPendingTemplate(null)}>Keep current plan</button><button type="button" className="button button-primary" onClick={() => loadTemplate(pendingTemplate)}>Use template</button></section>}
        <section className="planner-overview card" aria-label="Your weekly schedule">
          <div className="planner-heading"><div><h2>Your week</h2></div><span className="pill">{trainingDays} TRAINING {trainingDays === 1 ? 'DAY' : 'DAYS'}</span></div>
          <details className="rename-plan"><summary>Rename plan</summary><label className="planner-label mb-4">Plan name<input name="planName" required maxLength={80} value={draft.name} onChange={event => change({ ...draft, name: event.target.value, customized: true })} /></label></details>
          <div className="planner-week" role="group" aria-label="Choose a day">{draft.days.map((item, index) => <button key={item.id} type="button" className="planner-day" aria-pressed={index === dayIndex} aria-label={weekdays[index]} onClick={() => chooseDay(index)}>
            <span>{weekdays[index].slice(0,3)}</span><strong className="planner-day-name">{item.name}</strong><small>{item.type === 'rest' ? 'Rest day' : item.exercises.length + ' exercises'}</small>
          </button>)}</div>
          <div className="day-management"><button type="button" className="text-button" disabled={trainingDays === 7} onClick={addTrainingDay}>Add training day</button><p className="muted text-xs">{trainingDays} training / {7-trainingDays} rest</p></div>
        </section>
        <details className="gym-settings card">
          <summary><span><Icon name="workout" /><strong>My gym</strong></span><span className="muted">{draft.gymConfigured ? `${draft.equipment.length} equipment types` : 'Choose your equipment'} <span aria-hidden="true">＋</span></span></summary>
          <p className="muted text-sm my-4">Tick what your gym has. Bodyweight exercises are always available.</p>
          <div className="gym-equipment">{Object.entries(equipmentLabels).map(([id, label]) => <label key={id}><input type="checkbox" checked={draft.equipment.includes(id)} onChange={event => {
            change({ ...draft, gymConfigured: true, equipment: event.target.checked ? [...draft.equipment, id] : draft.equipment.filter(item => item !== id) })
            setOnlyGym(true)
          }} />{label}</label>)}</div>
          <button type="button" className="text-button" onClick={() => { change({ ...draft, gymConfigured: true, equipment: [] }); setOnlyGym(true) }}>I train without equipment</button>
        </details>
        <div className="planner-columns">
          <section className="card day-plan" aria-labelledby="day-plan-title">
            <div className="planner-heading"><div><p className="eyebrow">{weekdays[dayIndex]}</p><h2 id="day-plan-title">{day.name}</h2></div><span className="day-count">{day.exercises.length.toString().padStart(2, '0')}</span></div>
            <details className="day-settings"><summary>Edit day</summary><div className="day-management"><button type="button" className="text-button" disabled={dayIndex === 0} onClick={() => moveDay(-1)}>Move day earlier</button><button type="button" className="text-button" disabled={dayIndex === 6} onClick={() => moveDay(1)}>Move day later</button></div>
            <label className="planner-label mb-4">Day name<input name="sessionName" required maxLength={60} value={day.name} onChange={event => updateDay({ ...day, name: event.target.value })} /></label>
            {day.type === 'rest' ? <div className="plan-empty"><h3>Rest day</h3><p className="muted">No exercises on this day. Move it to another weekday, or turn it into a training day.</p><button type="button" className="button button-secondary" onClick={addTrainingDay}>Make training day</button></div> : <>
              <label className="planner-label mb-4">Training focus<select name="trainingFocus" value={focus} onChange={event => {
                const nextFocus = event.target.value as TrainingFocus
                updateDay({ ...day, targetMuscleGroups: [...focusTargets[nextFocus]] })
                setMuscle('All'); setChestFocus('all'); setQuery(''); setOnlyFocus(true)
              }}>{Object.entries(focusLabels).filter(([key]) => key !== 'rest').map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <details className="day-muscles"><summary>Customize muscle groups ({day.targetMuscleGroups.length})</summary><div className="gym-equipment">{Object.entries(targetMuscleLabels).map(([id,label]) => <label key={id}><input type="checkbox" aria-label={'Target ' + label} checked={day.targetMuscleGroups.includes(id as TargetMuscle)} onChange={event => updateDay({ ...day, targetMuscleGroups: event.target.checked ? [...day.targetMuscleGroups, id as TargetMuscle] : day.targetMuscleGroups.filter(item => item !== id) })} />{label}</label>)}</div></details>
              <p className="muted text-xs my-3">{day.targetMuscleGroups.length ? day.targetMuscleGroups.map(id => targetMuscleLabels[id]).join(', ') : 'Free choice: all muscle groups.'}</p>
              <button type="button" className="text-button" onClick={() => day.exercises.length ? setConfirmRest(true) : makeRest()}>Remove training day / add rest</button>
              {confirmRest && <div className="delete-confirm"><p>Make this a rest day? Its exercises will be removed from this plan.</p><button type="button" className="text-button" onClick={() => setConfirmRest(false)}>Keep training day</button><button type="button" className="text-button" onClick={makeRest}>Make rest day</button></div>}
            </>}
            </details>
            {day.type === 'rest' && <p className="muted">Rest day. Take your time to recover.</p>}
            {day.type === 'rest' ? null : !day.exercises.length ? <div className="plan-empty"><Icon name="workout" /><h3>A day with possibilities.</h3><p className="muted">Choose your first exercise below, or keep this as a rest day.</p><button type="button" className="button button-secondary" onClick={openFullLibrary}>Find your exercises <Icon name="plus" /></button></div> :
              <ol className="planned-exercises">{day.exercises.map((item, index) => {
                const exercise = exerciseById.get(item.exerciseId)!
                const missing = draft.gymConfigured && !availableAtGym(exercise, draft.equipment)
                return <li key={item.exerciseId} data-exercise={exercise.id}>
                  <div className="planned-exercise-heading"><button type="button" className="exercise-thumb" aria-label={`View ${exercise.name}`} onClick={() => setDetails(exercise)}><ExerciseAnimation exercise={exercise} paused /></button><div><span className="eyebrow">{String(index + 1).padStart(2, '0')} / {exercise.muscle}</span><h3>{exercise.name}</h3></div><button type="button" className="icon-button" aria-label={`Remove ${exercise.name}`} onClick={() => updateDay({ ...day, exercises: day.exercises.filter(entry => entry.exerciseId !== item.exerciseId) })}>×</button></div>
                  {missing && <p className="text-orange text-xs mt-2">Equipment not selected in My gym.</p>}
                  {exercise.chestFocus && <p className="exercise-target mt-2">{chestFocusLabels[exercise.chestFocus]} emphasis</p>}
                  {!matchesDay(exercise, day) && <p className="muted text-xs mt-2">Kept from your plan · outside this day’s focus.</p>}
                  <details className="prescription-editor"><summary>{item.sets} sets / {item.reps}{item.repsMax ? `-${item.repsMax}` : ''} {exercise.unit} / {item.weightKg === null ? 'No weight set' : `${item.weightKg} kg`}<span>Edit</span></summary><button type="button" className="text-button" aria-label={`Replace ${exercise.name}`} onClick={() => { clearLibraryFilters(); setReplacing(item.exerciseId); setMuscle(exercise.muscle); revealLibrary() }}>Replace exercise</button>
                  <div className="planned-exercise-controls">
                    <label>Sets<input aria-label={`${exercise.name} sets`} name={`sets-${item.exerciseId}`} type="number" min={1} max={20} step={1} required value={item.sets || ''} onChange={event => updateDay({ ...day, exercises: day.exercises.map((entry, i) => i === index ? { ...entry, sets: Number(event.target.value) } : entry) })} /></label>
                    <span aria-hidden="true">×</span>
                    <label>{exercise.unit === 'sec' ? 'Seconds' : 'Reps'}<input aria-label={`${exercise.name} ${exercise.unit}`} name={`reps-${item.exerciseId}`} type="number" min={1} max={exercise.unit === 'sec' ? 600 : 100} step={1} required value={item.reps || ''} onChange={event => updateDay({ ...day, exercises: day.exercises.map((entry, i) => i === index ? { ...entry, reps: Number(event.target.value) } : entry) })} /></label>
                    {exercise.unit === 'reps' && <label>Up to reps (optional)<input aria-label={exercise.name + ' maximum reps'} name={'repsMax-'+item.exerciseId} type="number" min={item.reps || 1} max={100} step={1} placeholder="Fixed reps" value={item.repsMax ?? ''} onChange={event=>updateDay({...day,exercises:day.exercises.map((entry,i)=>i===index?{...entry,repsMax:event.target.value===''?undefined:Number(event.target.value)}:entry)})}/></label>}
                    <label>Weight (kg)<input aria-label={`${exercise.name} weight`} name={`weight-${item.exerciseId}`} type="number" min={0} max={1000} step="0.5" placeholder="Unset" value={item.weightKg ?? ''} onChange={event => updateDay({ ...day, exercises: day.exercises.map((entry,i) => i === index ? { ...entry, weightKg: event.target.value === '' ? null : Number(event.target.value) } : entry) })} /></label>
                    <label>Rest (sec)<input aria-label={`${exercise.name} rest`} name={`rest-${item.exerciseId}`} type="number" min={0} max={1800} step={1} required value={Number.isNaN(item.restSeconds) ? '' : item.restSeconds} onChange={event => updateDay({ ...day, exercises: day.exercises.map((entry,i) => i === index ? { ...entry, restSeconds: event.target.value === '' ? NaN : Number(event.target.value) } : entry) })} /></label>
                    <div className="exercise-order"><button type="button" className="icon-button" aria-label={`Move ${exercise.name} up`} disabled={index === 0 || saving} onClick={() => move(index, -1)}>↑</button><button type="button" className="icon-button" aria-label={`Move ${exercise.name} down`} disabled={index === day.exercises.length - 1 || saving} onClick={() => move(index, 1)}>↓</button></div>
                  </div></details>
                </li>
              })}</ol>}
            {day.type === 'workout' && <button type="button" className="button button-secondary" onClick={openFullLibrary}>Add exercise from library</button>}

          </section>
          <section hidden={!libraryOpen} ref={library} tabIndex={-1} className="exercise-library" aria-labelledby="library-title">
            <div className="planner-heading"><h2 id="library-title">Add an exercise</h2><button type="button" className="text-button" onClick={()=>{setLibraryOpen(false);setReplacing(null)}}>Close library</button></div>
            <div className="library-actions"><button type="button" className="button button-secondary" onClick={()=>setEditingCustom('new')}>Create Custom Exercise</button><button type="button" className="text-button" onClick={clearLibraryFilters}>Reset library filters</button></div>
            {(muscle === 'Chest' || focus === 'push' || chestFocus !== 'all') && <details className="chest-guide" aria-label="Chest emphasis"><summary>Chest regions</summary>
              <div className="planner-heading"><div><p className="eyebrow">GET TO KNOW YOUR CHEST</p><h3>Different angles. Different emphasis.</h3></div><button type="button" className="text-button" onClick={() => setChestFocus('all')} aria-pressed={chestFocus === 'all'}>All areas</button></div>
              <div className="chest-focus-options">{(Object.keys(chestFocusLabels) as (keyof typeof chestFocusLabels)[]).map(area => {
                const count = day.exercises.filter(item => exerciseById.get(item.exerciseId)?.chestFocus === area).length
                return <button type="button" key={area} data-chest-focus={area} aria-pressed={chestFocus === area} onClick={() => { setChestFocus(area); setMuscle('Chest'); setQuery('') }}><strong>{chestFocusLabels[area]}</strong><span>{area === 'upper' ? 'Incline & upward fly' : area === 'mid' ? 'Flat press & horizontal fly' : 'Decline & downward fly'}</span><small>{count} in this day</small></button>
              })}</div>
              <details className="chest-explanation"><summary>How to use these labels</summary><p>These are emphasis labels, not isolated muscles or three required exercises. Presses and fly movements overlap. Choose variations you enjoy and can perform with your equipment.</p>{Object.entries(chestFocusNotes).map(([area, note]) => <p key={area}>{note}</p>)}<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7579505/" target="_blank" rel="noreferrer">Research on bench angle and muscle activity</a></details>
            </details>}
            {replacing && <div className="setup-banner"><span>Replacing {exerciseById.get(replacing)?.name}. Choose another exercise. Its weight will be unset.</span><button type="button" className="text-button" onClick={() => setReplacing(null)}>Cancel replacement</button></div>}
            <div className="library-filters"><label className="planner-label"><span className="sr-only">Search exercises</span><input type="search" name="exerciseSearch" placeholder="Search exercises or equipment…" value={query} onChange={event => setQuery(event.target.value)} /></label><label className="planner-label"><span className="sr-only">Muscle group</span><select name="muscleGroup" value={muscle} onChange={event => { setMuscle(event.target.value); setChestFocus('all') }}><option value="All">All muscle groups</option>{muscleGroups.map(group => <option key={group}>{group}</option>)}<optgroup label="Specific muscles (primary or secondary)">{Object.entries(targetMuscleLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</optgroup></select></label></div>
            <details className="library-advanced" open={!!(subgroup || equipmentFilter || typeFilter || movementFilter)}><summary>More filters: muscle subgroup, equipment, type &amp; movement</summary><div className="library-filters">
              <label className="planner-label">Muscle subgroup<select name="muscleSubgroup" value={subgroup} onChange={e=>setSubgroup(e.target.value as MuscleSubgroup | '')}><option value="">All subgroups</option>{Object.entries(muscleSubgroups).map(([id,item])=><option key={id} value={id}>{item.label}</option>)}</select></label>
              <label className="planner-label">Equipment<select name="equipmentFilter" value={equipmentFilter} onChange={e=>setEquipmentFilter(e.target.value as EquipmentType | '')}><option value="">All equipment</option>{Object.entries(equipmentTypeLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
              <label className="planner-label">Exercise type<select name="exerciseType" value={typeFilter} onChange={e=>setTypeFilter(e.target.value as ExerciseType | '')}><option value="">Compound &amp; isolation</option>{Object.entries(exerciseTypeLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
              <label className="planner-label">Movement pattern<select name="movementPattern" value={movementFilter} onChange={e=>setMovementFilter(e.target.value as MovementPattern | '')}><option value="">All movements</option>{Object.entries(movementLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
            </div></details>
            <div className="library-toggles"><button type="button" aria-pressed={customOnly} onClick={()=>setCustomOnly(!customOnly)}>My exercises</button>{day.type === 'workout' && day.targetMuscleGroups.length > 0 && focus !== 'full' && <button type="button" aria-pressed={onlyFocus} onClick={() => setOnlyFocus(!onlyFocus)}>{focus === 'all' ? 'Day muscles' : focusLabels[focus]} focus</button>}<button type="button" aria-pressed={onlyGym} onClick={() => setOnlyGym(!onlyGym)}>My gym only</button><button type="button" aria-pressed={onlyFavorites} onClick={() => setOnlyFavorites(!onlyFavorites)}><span aria-hidden="true">♡</span> Favorites</button><span className="muted text-xs">Adding to {day.name}</span></div>
            {onlyGym && !draft.gymConfigured && <p className="muted text-sm mb-4">Showing bodyweight exercises. Select equipment in My gym to see more.</p>}
            {!visible.length && <div className="card plan-empty"><h3>{day.type === 'rest' ? 'A little room to recover.' : 'No exercises match just yet.'}</h3><p className="muted">{focus === 'rest' && onlyFocus ? 'Use Make training day to add exercises here.' : 'Try another muscle group, add favorites, or update your gym equipment.'}</p><button type="button" className="text-button" onClick={() => { if (day.type === 'rest') addTrainingDay(); else clearLibraryFilters() }}>{day.type === 'rest' ? 'Train on this day' : 'Show all exercises'}</button></div>}
            <div className="exercise-grid">{shown.map(exercise => {
              const added = day.exercises.some(item => item.exerciseId === exercise.id)
              const loved = draft.favorites.includes(exercise.id)
              return <article className="exercise-card" key={exercise.id} data-catalog-exercise={exercise.id}>
                <div className="exercise-photo"><button type="button" className="exercise-photo-open" onClick={() => setDetails(exercise)} aria-label={`View ${exercise.name}`}><ExerciseAnimation exercise={exercise} paused /></button><button type="button" className="favorite-button" aria-label={`Favorite ${exercise.name}`} aria-pressed={loved} onClick={() => favorite(exercise.id)}>{loved ? '♥' : '♡'}</button><span className="exercise-muscle">{exercise.muscle}</span></div>
                <div className="exercise-card-copy">{exercise.isCustom && <span className="exercise-target">Custom exercise</span>}{exercise.chestFocus && <span className="exercise-target">{chestFocusLabels[exercise.chestFocus]}</span>}<h3><button type="button" onClick={() => setDetails(exercise)}>{exercise.name}</button></h3><p className="muted">{exercise.equipment.length ? exercise.equipment.map(item => equipmentLabels[item]).join(' · ') : 'Bodyweight · no equipment'}</p><button type="button" className={`button ${added ? 'button-secondary' : 'button-primary'}`} disabled={added || saving || day.type === 'rest' || (!replacing && day.exercises.length >= 20)} onClick={() => add(exercise)}>{added ? 'Added' : replacing ? 'Use instead' : 'Add exercise'}<span aria-hidden="true">{added ? '✓' : '+'}</span></button></div>
              </article>
            })}</div>
            {visible.length > shown.length && <button type="button" className="button button-secondary mt-4" onClick={()=>setPage({key:filterKey,count:visibleCount+24})}>Show more exercises ({shown.length} of {visible.length})</button>}
            {day.exercises.length >= 20 && <p className="muted text-sm mt-3">This day has 20 exercises. Remove one before adding another.</p>}
          </section>
        </div>
      </fieldset>
      {(dirty || message || error) && <div className="plan-save-bar"><div><strong>{dirty ? 'Unsaved changes' : 'Plan saved'}</strong><p role="status" className="text-accent text-xs mt-1">{message}</p>{error && <p role="alert" className="text-orange text-xs mt-1">{error}</p>}</div><button type="submit" disabled={saving || !dirty} className="button button-primary">{saving ? 'Saving…' : 'Save plan'}<span aria-hidden="true">✓</span></button></div>}
    </form>
    {editingCustom && <CustomExerciseEditor key={typeof editingCustom==='string'?'new':editingCustom.id} initial={editingCustom==='new'?undefined:editingCustom} onSave={saveCustom} onClose={()=>setEditingCustom(null)}/>}
    {details && <ExerciseDetails onEdit={()=>{setEditingCustom(details);setDetails(null)}} exercise={details} day={day.name} added={day.exercises.some(item => item.exerciseId === details.id)} disabled={saving || day.type === 'rest' || (!replacing && day.exercises.length >= 20)} actionLabel={replacing ? 'Use instead' : undefined} equipment={draft.gymConfigured ? draft.equipment : null} onAdd={() => add(details)} onClose={() => setDetails(null)} />}
  </>
}
