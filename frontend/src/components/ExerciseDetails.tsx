import { exerciseTypeLabels, movementLabels, muscleSubgroups } from '../data/exerciseTaxonomy'
import { exerciseMotions, schematicExerciseIds } from '../data/exerciseMotion'
import { useEffect, useRef, useState } from 'react'
import { chestFocusLabels, chestFocusNotes, equipmentLabels, type CatalogExercise } from '../data/exercises'
import { targetMuscleLabels } from '../data/trainingSplits'
import { ExerciseAnimation } from './ExerciseAnimation'

interface Props { exercise: CatalogExercise; day: string; added: boolean; disabled: boolean; equipment: string[] | null; onAdd: () => void; onClose: () => void; actionLabel?: string; onEdit?: () => void }
export function ExerciseDetails({ exercise, day, added, disabled, equipment, onAdd, onClose, actionLabel, onEdit }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  const missing = equipment === null ? [] : exercise.equipment.filter(item => !equipment.includes(item))
  return <dialog ref={dialog} className="exercise-dialog" aria-labelledby="exercise-detail-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="exercise-dialog-content"><div className="planner-heading"><div><p className="eyebrow">{exercise.muscle}</p><h2 id="exercise-detail-title">{exercise.name}</h2></div><button type="button" className="icon-button" aria-label="Close exercise details" onClick={onClose} autoFocus>×</button></div>
      <div className="exercise-motion-detail"><ExerciseAnimation exercise={exercise} paused={paused} /></div>
      {exerciseMotions[exercise.id] && <div className="motion-caption"><p className="muted text-xs">{exerciseMotions[exercise.id]?.from === exerciseMotions[exercise.id]?.to ? 'Hold position' : schematicExerciseIds.has(exercise.id) ? 'Schematic movement; setup varies by machine' : 'Movement preview'}</p><button type="button" className="text-button" onClick={() => setPaused(!paused)}>{paused ? 'Play movement' : 'Pause movement'}</button></div>}
      {exercise.chestFocus && <section className="exercise-emphasis"><h3>{chestFocusLabels[exercise.chestFocus]} emphasis</h3><p>{chestFocusNotes[exercise.chestFocus]}</p><p>Other chest regions also work; this is an emphasis, not isolation.</p></section>}
      <section className="exercise-emphasis"><h3>Muscle groups</h3><p><strong>Primary:</strong> {targetMuscleLabels[exercise.primaryMuscle]}</p><p><strong>Secondary:</strong> {exercise.secondaryMuscles.length ? exercise.secondaryMuscles.map(id => targetMuscleLabels[id]).join(', ') : 'None listed'}</p></section><h3 className="mt-5">What you need</h3><p className="muted text-sm mt-2">{exercise.equipment.length ? exercise.equipment.map(item => equipmentLabels[item]).join(' · ') : 'Bodyweight. No equipment needed.'}</p>
      <section className="exercise-emphasis"><h3>Movement details</h3><p>{exerciseTypeLabels[exercise.exerciseType]} / {movementLabels[exercise.movementPattern]} / {exercise.unilateral?'One side at a time':'Both sides'}</p><p>{exercise.muscleSubgroups.map(id=>muscleSubgroups[id].label).join(', ')}</p><p className="muted text-xs">These tags describe muscles involved, not exclusive isolation or a measured share of the work.</p></section>
      {exercise.instructions.length > 0 && <section className="exercise-emphasis"><h3>Movement cues</h3><ol>{exercise.instructions.map((line,index)=><li key={index}>{line}</li>)}</ol></section>}
      {exercise.notes && <section className="exercise-emphasis"><h3>Your notes</h3><p className="exercise-notes">{exercise.notes}</p></section>}
      {exercise.isCustom && onEdit && <button type="button" className="text-button" onClick={onEdit}>Edit custom exercise</button>}
      {missing.length > 0 && <p className="text-orange text-sm mt-3">Not selected in My gym: {missing.map(item => equipmentLabels[item]).join(', ')}.</p>}
      <button type="button" className="button button-primary mt-5 w-full" disabled={added || disabled} onClick={() => { onAdd(); onClose() }}>{added ? `Already on ${day}` : actionLabel ?? `Add to ${day}`}<span aria-hidden="true">{added ? '✓' : '+'}</span></button>
    </div>
  </dialog>
}
