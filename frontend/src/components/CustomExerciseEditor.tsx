import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import { completeExercise, equipmentLabels, type CatalogExercise, type Equipment, type MuscleGroup } from '../data/exercises'
import { exerciseTypeLabels, movementLabels, type ExerciseType, type MovementPattern } from '../data/exerciseTaxonomy'
import { targetMuscleLabels } from '../data/trainingSplits'
import type { TargetMuscle } from '../types/models'

export function CustomExerciseEditor({ initial, onSave, onClose }: {initial?: CatalogExercise; onSave:(exercise:CatalogExercise)=>void; onClose:()=>void}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [name,setName] = useState(initial?.name ?? '')
  const [primary,setPrimary] = useState<TargetMuscle>(initial?.primaryMuscle ?? 'chest')
  const [secondary,setSecondary] = useState<TargetMuscle[]>(initial?.secondaryMuscles ?? [])
  const [equipment,setEquipment] = useState<Equipment[]>(initial?.equipment ?? [])
  const [type,setType] = useState<ExerciseType>(initial?.exerciseType ?? 'compound')
  const [movement,setMovement] = useState<MovementPattern>(initial?.movementPattern ?? 'other')
  const [notes,setNotes] = useState(initial?.notes ?? '')
  const [aliases,setAliases] = useState(initial?.aliases.join(', ') ?? '')
  const [unilateral,setUnilateral] = useState(initial?.unilateral ?? false)
  const [unit,setUnit] = useState<'reps'|'sec'>(initial?.unit ?? 'reps')
  useEffect(()=>{ const element=dialog.current; element?.showModal(); return ()=>element?.close() },[])
  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return
    const muscle: MuscleGroup = primary==='chest'?'Chest':primary==='back'||primary==='erectors'?'Back':primary.includes('delts')?'Shoulders':primary==='biceps'||primary==='triceps'?'Arms':primary==='forearms'?'Forearms':primary==='core'?'Core':['quads','hamstrings','glutes','calves','adductors','abductors'].includes(primary)?'Legs':'Other'
    onSave(completeExercise({id:initial?.id ?? 'custom-'+crypto.randomUUID(),name:name.trim(),primaryMuscle:primary,secondaryMuscles:secondary.filter(id=>id!==primary),muscle,equipment,exerciseType:type,movementPattern:movement,unilateral,unit,notes:notes.trim(),aliases:aliases.split(',').map(s=>s.trim()).filter(Boolean).slice(0,30),isCustom:true,instructions:[]}))
  }
  return <dialog ref={dialog} className="exercise-dialog" aria-labelledby="custom-exercise-title" onCancel={onClose}>
    <form className="exercise-dialog-content custom-exercise-form" onSubmit={submit}>
      <div className="planner-heading"><h2 id="custom-exercise-title">{initial?'Edit custom exercise':'Create Custom Exercise'}</h2><button type="button" className="icon-button" aria-label="Close custom exercise" onClick={onClose}>×</button></div>
      <p className="muted text-sm">Your own machine or movement. Available across this account's workouts after you save the plan.</p>
      <label className="planner-label">Exercise name<input name="customName" autoFocus required maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Panatta incline chest press" /></label>
      <label className="planner-label">Primary muscle<select name="customPrimary" value={primary} onChange={e=>setPrimary(e.target.value as TargetMuscle)}>{Object.entries(targetMuscleLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
      <details><summary>Secondary muscles ({secondary.filter(id=>id!==primary).length})</summary><div className="gym-equipment">{Object.entries(targetMuscleLabels).filter(([id])=>id!==primary).map(([id,label])=><label key={id}><input type="checkbox" checked={secondary.includes(id as TargetMuscle)} onChange={e=>setSecondary(e.target.checked?[...secondary,id as TargetMuscle]:secondary.filter(m=>m!==id))}/>{label}</label>)}</div></details>
      <label className="planner-label">Equipment<select name="customEquipment" value={equipment[0] ?? ''} onChange={e=>setEquipment(e.target.value?[e.target.value as Equipment]:[])}><option value="">Bodyweight / no equipment</option>{Object.entries(equipmentLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
      <details><summary>Additional equipment ({equipment.length})</summary><div className="gym-equipment">{Object.entries(equipmentLabels).map(([id,label])=><label key={id}><input type="checkbox" checked={equipment.includes(id as Equipment)} onChange={e=>setEquipment(e.target.checked?[...equipment,id as Equipment]:equipment.filter(item=>item!==id))}/>{label}</label>)}</div></details>
      <label className="planner-label">Exercise type<select name="customType" value={type} onChange={e=>setType(e.target.value as ExerciseType)}>{Object.entries(exerciseTypeLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
      <label className="planner-label">Movement pattern<select name="customMovement" value={movement} onChange={e=>setMovement(e.target.value as MovementPattern)}>{Object.entries(movementLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
      <label className="planner-label">Target unit<select name="customUnit" value={unit} disabled={!!initial} onChange={e=>setUnit(e.target.value as 'reps'|'sec')}><option value="reps">Reps</option><option value="sec">Seconds / hold</option></select></label>
      <label><input type="checkbox" checked={unilateral} onChange={e=>setUnilateral(e.target.checked)}/> One side at a time</label>
      <label className="planner-label">Aliases (comma separated)<input name="customAliases" maxLength={500} value={aliases} onChange={e=>setAliases(e.target.value)}/></label>
      <label className="planner-label">Notes<textarea name="customNotes" maxLength={1000} rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Machine settings, setup or your own cues"/></label>
      <button className="button button-primary" type="submit" disabled={!name.trim()}>{initial?'Apply exercise changes':'Create exercise'}</button>
      <button className="button button-secondary" type="button" onClick={onClose}>Cancel</button>
    </form>
  </dialog>
}
