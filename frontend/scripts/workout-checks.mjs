import assert from 'node:assert/strict'

export async function checkWorkoutPlanner({ evaluate, route, field, clickText, waitText, reload, snapshot, call, waitFor }) {
  const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`)
  const selectDay = name => click(`.planner-day[aria-label="${name}"]`)
  const add = id => click(`[data-catalog-exercise="${id}"] .exercise-card-copy > button`)
  const stored = () => evaluate(`import('/src/services/dataRepository.ts').then(async m => (await m.dataRepository.load()).workoutPlan)`)
  await route('workout', 'Your week. Your workout.')
  await selectDay('Monday')
  assert.equal(await evaluate(`document.querySelectorAll('.planned-exercises > li').length`), 0)
  assert.equal(await evaluate(`document.querySelectorAll('.exercise-card').length`), 0)
  const catalogIds = () => evaluate(`[...document.querySelectorAll('.exercise-card')].map(card => card.dataset.catalogExercise)`)
  for (const [id, count] of [['ppl5',5],['upper-lower',4],['full-body',3],['arnold',6],['bro',5]]) {
    await click('[data-split="' + id + '"]')
    if (id !== 'ppl5') await clickText('Use template')
    assert.equal(await evaluate(`[...document.querySelectorAll('.planner-day small')].filter(n => n.textContent !== 'Rest day').length`), count)
  }
  await click('[data-split="ppl5"]'); await clickText('Keep current plan')
  assert.equal(await evaluate(`document.querySelector('[data-split="bro"]').getAttribute('aria-pressed')`), 'true')
  await click('[data-split="ppl5"]'); await clickText('Use template')
  await clickText('Add exercise from library'); await field('trainingFocus','push')
  await evaluate('window.scrollTo(0,0)'); await snapshot('split-templates-mobile')
  await evaluate(`document.querySelector('.planner-overview').scrollIntoView()`); await snapshot('split-week-mobile')
  assert.ok((await catalogIds()).includes('triceps-pushdown'))
  assert.ok(!(await catalogIds()).includes('bicep-curl'))
  await click('[data-chest-focus="upper"]')
  const awaitedIds=await catalogIds()
  assert.ok(['incline-press','incline-barbell-press','incline-dumbbell-fly','low-high-fly','smith-incline'].every(id=>(awaitedIds).includes(id)))
  await click('[data-chest-focus="mid"]')
  await click('[data-catalog-exercise="chest-fly"] .exercise-photo-open')
  await waitFor(() => evaluate(`document.querySelectorAll('dialog [data-part="moving-machine-arms"] animate').length > 0`), 'complete chest fly')
  await snapshot('chest-fly-complete-mobile'); await click('[aria-label="Close exercise details"]')
  await selectDay('Tuesday')
  assert.ok((await catalogIds()).includes('face-pull'))
  assert.ok(!(await catalogIds()).includes('triceps-pushdown'))
  await selectDay('Friday')
  assert.ok((await catalogIds()).includes('bench-press'))
  assert.ok(!(await catalogIds()).includes('bicep-curl'), 'Upper main limits direct arms')
  await selectDay('Saturday')
  assert.ok((await catalogIds()).includes('rear-delt-fly'))
  assert.ok((await catalogIds()).includes('bicep-curl'))
  await selectDay('Thursday')
  assert.deepEqual(await catalogIds(), [])
  await clickText('Move day earlier')
  assert.deepEqual(await evaluate(`[...document.querySelectorAll('.planner-day strong')].map(n => n.textContent)`), ['Push','Pull','Rest','Legs','Upper Body','Shoulders + Arms','Rest'])
  await selectDay('Monday'); await clickText('Remove training day / add rest'); await clickText('Keep training day')
  assert.equal(await evaluate(`document.querySelectorAll('.planned-exercises > li').length`), 6)
  await clickText('Remove training day / add rest'); await clickText('Make rest day')
  assert.deepEqual(await catalogIds(), [])
  await clickText('Make training day'); await field('sessionName', 'Fresh workout')
  await field('trainingFocus', 'arms')
  assert.ok((await catalogIds()).includes('bicep-curl')); assert.ok(!(await catalogIds()).includes('bench-press'))
  await click('.day-muscles summary'); await click('[aria-label="Target Rear delts"]')
  assert.ok((await catalogIds()).includes('rear-delt-fly'), 'custom muscles update suggestions')
  await click('[data-split="custom"]'); await clickText('Use template')
  await clickText('Add training day')
  await field('planName', 'My flexible week')
  await click('.gym-settings summary')
  await evaluate(`for (const label of document.querySelectorAll('.gym-equipment label')) if (['Dumbbells', 'Adjustable bench'].includes(label.textContent.trim())) label.querySelector('input').click()`)
  await waitFor(() => evaluate(`document.querySelectorAll('.exercise-card').length === 24`), 'equipment filtering includes all required equipment')
  assert.equal(await evaluate(`!!document.querySelector('[data-catalog-exercise="bench-press"]')`), false, 'barbell and rack are required too')
  assert.equal(await evaluate(`!!document.querySelector('[data-catalog-exercise="leg-press"]')`), false, 'specific unselected machines are excluded')
  await click('.gym-settings summary')
  await field('muscleGroup', 'Chest')
  await field('exerciseSearch', 'incline dumbbell press')
  assert.equal(await evaluate(`document.querySelectorAll('.exercise-card').length`), 1)
  await click('[data-catalog-exercise="incline-press"] .favorite-button')
  await click('[data-catalog-exercise="incline-press"] .exercise-photo-open')
  await waitFor(() => evaluate('!!document.querySelector("dialog[open]")'), 'exercise details modal')
  await waitFor(() => evaluate(`document.querySelectorAll('dialog .exercise-animation animate').length > 0`), 'animated exercise figure')
  assert.equal(await evaluate(`document.querySelectorAll('#workout-plan-form img, dialog img').length`), 0, 'real-person photos are replaced')
  const moved = await evaluate(`(async () => {
    const svg = document.querySelector('dialog .exercise-animation');
    const measure = () => JSON.stringify([...svg.querySelectorAll('path')].map(path => {const b = path.getBBox(); return [b.x,b.y,b.width,b.height];}));
    svg.pauseAnimations(); svg.setCurrentTime(0); await new Promise(requestAnimationFrame); const start = measure();
    svg.setCurrentTime(1.8); await new Promise(requestAnimationFrame); const end = measure();
    svg.unpauseAnimations(); return start !== end;
  })()`)
  assert.ok(moved, 'the figure actually changes pose during the repetition')
  await clickText('Pause movement')
  assert.equal(await evaluate(`document.querySelectorAll('dialog animate, dialog animateTransform').length`), 0)
  await clickText('Play movement')
  await call('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion', value:'reduce'}]})
  await waitFor(() => evaluate(`document.querySelectorAll('dialog animate, dialog animateTransform').length === 0`), 'reduced motion preference')
  await call('Emulation.setEmulatedMedia', {features:[]})
  assert.equal(await evaluate(`document.activeElement.getAttribute('aria-label')`), 'Close exercise details')
  await snapshot('exercise-details-mobile')
  await clickText('Add to My workout')
  assert.equal(await evaluate(`document.querySelector('[data-catalog-exercise="incline-press"] .exercise-card-copy > button').disabled`), true)
  await field('sessionName', 'My upper body')
  await field('sets-incline-press', 4); await field('reps-incline-press', 8); await field('weight-incline-press', 22.5); await field('rest-incline-press', 120)
  await evaluate(`document.querySelector('.day-plan').scrollIntoView()`); await snapshot('split-editor-mobile')
  await field('exerciseSearch', ''); await field('muscleGroup', 'All')
  await add('dumbbell-row')
  await click('[aria-label="Move One-arm dumbbell row up"]')
  assert.equal(await evaluate(`document.querySelector('.planned-exercises > li').dataset.exercise`), 'dumbbell-row')
  await click('[aria-label="Remove One-arm dumbbell row"]')
  await add('dumbbell-row')
  await selectDay('Wednesday'); await clickText('Make training day'); await add('plank')
  assert.equal(await evaluate(`document.querySelector('[name="reps-plank"]').value`), '30')
  await field('reps-plank', 45)
  await field('sets-plank', 0)
  assert.equal(await evaluate(`document.querySelector('#workout-plan-form').checkValidity()`), false)
  await field('sets-plank', 3)
  // Failed writes must retain the editable plan and never claim success.
  await evaluate(`window.__open = IDBFactory.prototype.open; IDBFactory.prototype.open = () => { throw new Error('Simulated planner storage failure') }`)
  await clickText('Save plan'); await waitText('Simulated planner storage failure')
  assert.equal(await evaluate(`document.querySelector('[name="reps-plank"]').value`), '45')
  await evaluate('IDBFactory.prototype.open = window.__open')
  await clickText('Save plan'); await waitText('Your plan, favorites and gym equipment are saved.')
  const saved = await stored()
  assert.deepEqual(saved.equipment, ['dumbbells', 'bench'])
  assert.deepEqual(saved.favorites, ['incline-press'])
  assert.equal(saved.days[0].name, 'My upper body')
  assert.deepEqual(saved.days[0].exercises[0], {exerciseId:'incline-press', sets:4, reps:8, weightKg:22.5, restSeconds:120})
  assert.deepEqual(saved.days[2].exercises[0], {exerciseId:'plank', sets:3, reps:45, weightKg:null, restSeconds:90})
  assert.equal(saved.days[1].exercises.length, 0)
  await reload('Your week. Your workout.'); await selectDay('Monday')
  assert.equal(await evaluate(`document.querySelector('[name="weight-incline-press"]').value`), '22.5')
  assert.equal(await evaluate(`document.querySelector('[name="rest-incline-press"]').value`), '120')
  await click('[aria-label="Replace One-arm dumbbell row"]')
  await add('chest-supported-row')
  assert.equal(await evaluate(`document.querySelectorAll('[data-exercise="dumbbell-row"]').length`), 0)
  assert.equal(await evaluate(`document.querySelectorAll('[data-exercise="chest-supported-row"]').length`), 1)
  await clickText('Save plan'); await waitText('Your plan, favorites and gym equipment are saved.')
  await field('muscleGroup', 'All')
  await clickText('Favorites')
  assert.equal(await evaluate(`document.querySelectorAll('.exercise-card').length`), 1)
  await clickText('Favorites')
  await snapshot('workout-planner-mobile')
  await evaluate(`document.querySelector('.exercise-library').scrollIntoView()`)
  assert.equal(await evaluate(`document.querySelectorAll('.exercise-card animate').length`), 0, 'catalog cards stay still until details are opened')
  await snapshot('workout-library-mobile')
  for (const width of [320, 384, 768, 1440]) {
    await call('Emulation.setDeviceMetricsOverride', {width, height:1000, deviceScaleFactor:1, mobile:width < 800})
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `planner fits ${width}px`)
  }
  await evaluate('window.scrollTo(0,0)'); await snapshot('workout-planner-desktop')
  const validation = await evaluate(`(async () => {
    const {dataRepository} = await import('/src/services/dataRepository.ts');
    const saved = (await dataRepository.load()).workoutPlan;
    const invalid = structuredClone(saved); invalid.days[0].exercises[0].sets = 0;
    let rejected = false;
    try { await dataRepository.saveWorkoutPlan(invalid); } catch { rejected = true; }
    const unchanged = JSON.stringify((await dataRepository.load()).workoutPlan) === JSON.stringify(saved);
    const {exercises} = await import('/src/data/exercises.ts');
    const {exerciseMotions} = await import('/src/data/exerciseMotion.ts');
    const complete = exercises.every(exercise => exerciseMotions[exercise.id]?.from.length === 11 && exerciseMotions[exercise.id]?.to.length === 11 && [...exerciseMotions[exercise.id].from, ...exerciseMotions[exercise.id].to].every(([x,y]) => Number.isFinite(x) && x >= 0 && x <= 300 && Number.isFinite(y) && y >= 0 && y <= 215));
    const {validWorkoutPlan, parseWorkoutPlan} = await import('/src/utils/workoutPlan.ts');
    const {applySplit, trainingSplits, movePlanDay, matchesDay} = await import('/src/data/trainingSplits.ts');
    const expected = {
      ppl5:['Push','Pull','Legs','Rest','Upper Body','Shoulders + Arms','Rest'],
      'upper-lower':['Upper body','Lower','Rest','Upper body','Lower','Rest','Rest'],
      'full-body':['Full body','Rest','Full body','Rest','Full body','Rest','Rest'],
      arnold:['Chest + Back','Shoulders + Arms','Legs','Chest + Back','Shoulders + Arms','Legs','Rest'],
      bro:['Chest','Back','Shoulders','Legs','Full arms','Rest','Rest']
    };
    const templatesValid = trainingSplits.every(t => JSON.stringify(t.days.map(d=>d.name)) === JSON.stringify(expected[t.id]) && validWorkoutPlan(applySplit(saved,t.id)) && t.days.filter(d=>d.type==='workout').length === t.recommendedDaysPerWeek && t.days.every(d=>d.type!=='rest' || !d.exercises.length));
    const clone = applySplit(saved,'ppl5'); const original = JSON.stringify(trainingSplits[0]); clone.days[0].exercises[0].sets=7;
    const independent = original === JSON.stringify(trainingSplits[0]);
    const moved = movePlanDay(clone,3,2);
    const wholeDayMoved = moved.days[3].id === clone.days[2].id && JSON.stringify(moved.days[3]) === JSON.stringify(clone.days[2]);
    const legacy = {id:'weekly-plan',split:'ppl3',equipment:saved.equipment,favorites:saved.favorites,gymConfigured:true,days:saved.days.map(d=>({name:d.name,focus:d.type==='rest'?'rest':'all',exercises:d.exercises.map(({exerciseId,sets,reps})=>({exerciseId,sets,reps}))}))};
    const migrated = parseWorkoutPlan(legacy);
    const legacyKept = migrated.days[0].exercises[0].sets === 4 && migrated.days[0].name === 'My upper body' && migrated.days[0].exercises[0].weightKg === null && migrated.days[1].type === 'rest';
    let corruptRejected=false; try {parseWorkoutPlan({...legacy,schemaVersion:99})} catch {corruptRejected=true}
    const invalidRest=structuredClone(saved); invalidRest.days[0].type='rest';
    const invalidWeight=structuredClone(saved); invalidWeight.days[0].exercises[0].weightKg=-1;
    const invalidTime=structuredClone(saved); invalidTime.days[0].exercises[0].restSeconds=Infinity;
    const extensible=matchesDay({...exercises[0],id:'future-exercise'},clone.days[0]);
    return {rejected,unchanged,complete,templatesValid,independent,wholeDayMoved,legacyKept,corruptRejected,extensible,invalidRejected:![invalidRest,invalidWeight,invalidTime].some(plan=>validWorkoutPlan(plan))};
  })()`)
  assert.ok(Object.values(validation).every(Boolean), JSON.stringify(validation))
  // Exercise the actual version-2 upgrade with existing profile and legacy history.
  assert.deepEqual(await evaluate(`(async () => {
    const {dataRepository, createDataRepository} = await import('/src/services/dataRepository.ts');
    const profile = (await dataRepository.load()).profile;
    await new Promise((resolve,reject) => {
      const request = indexedDB.open('forma-workout-migration-test', 2);
      request.onupgradeneeded = () => ['profiles','nutrition','weights','workouts','progress'].forEach(name => request.result.createObjectStore(name,{keyPath:'id'}));
      request.onerror = reject;
      request.onsuccess = () => {
        const db = request.result; const tx = db.transaction(['profiles','progress'],'readwrite');
        tx.objectStore('profiles').put(profile); tx.objectStore('progress').put({id:'legacy',note:'keep'});
        tx.oncomplete = () => {db.close();resolve();}; tx.onabort = reject;
      };
    });
    const loaded = await createDataRepository('forma-workout-migration-test').load();
    const record = await new Promise((resolve,reject) => {
      const request = indexedDB.open('forma-workout-migration-test', 4); request.onerror = reject;
      request.onsuccess = () => { const db = request.result; const tx = db.transaction('progress'); const get = tx.objectStore('progress').get('legacy'); tx.oncomplete = () => {db.close();resolve(get.result.note);}; };
    });
    return {profileKept:JSON.stringify(loaded.profile) === JSON.stringify(profile), empty:loaded.workoutPlan.days.every(day => !day.exercises.length), record};
  })()`), {profileKept:true, empty:true, record:'keep'})
  // A legacy plan is upgraded in memory; loading must not rewrite its persisted record.
  assert.deepEqual(await evaluate(`(async () => {
    const {createDataRepository} = await import('/src/services/dataRepository.ts');
    const repo = createDataRepository('forma-workout-migration-test');
    const legacy = {id:'weekly-plan',split:'ppl6',equipment:['dumbbells'],favorites:['bicep-curl'],gymConfigured:true,
      days:Array.from({length:7},(_,i)=>({name:'Original day '+i,focus:i===6?'rest':'pull',exercises:i===0?[{exerciseId:'bicep-curl',sets:4,reps:12}]:[]}))};
    const raw = (write) => new Promise((resolve,reject) => {
      const req=indexedDB.open('forma-workout-migration-test',4); req.onerror=reject;
      req.onsuccess=()=>{const db=req.result; const tx=db.transaction('workoutPlans',write?'readwrite':'readonly');
        const request=write?tx.objectStore('workoutPlans').put(legacy):tx.objectStore('workoutPlans').get('weekly-plan');
        tx.oncomplete=()=>{db.close();resolve(request.result)};tx.onabort=reject;};
    });
    await raw(true); const loaded=await repo.load(); const kept=JSON.stringify(await raw(false))===JSON.stringify(legacy);
    await repo.saveWorkoutPlan(loaded.workoutPlan); const saved=await raw(false);
    return {kept,version:saved.schemaVersion,name:saved.days[0].name,sets:saved.days[0].exercises[0].sets,rest:saved.days[6].type};
  })()`), {kept:true,version:2,name:'Original day 0',sets:4,rest:'rest'})
  // Exercise library: aliases, compound filters, pagination and per-account custom entries.
  const catalog = await evaluate(`import('/src/data/exercises.ts').then(m=>m.exercises)`)
  assert.ok(catalog.length >= 200, 'large centrally seeded catalog')
  assert.equal(new Set(catalog.map(e=>e.id)).size,catalog.length,'stable unique exercise IDs')
  assert.ok(catalog.find(e=>e.id==='pullup').equipmentTypes.includes('bodyweight'))
  assert.ok(catalog.find(e=>e.id==='cable-row').equipmentTypes.includes('cable'))
  assert.ok(catalog.every(e=>e.primaryMuscle && e.muscleSubgroups.length && e.equipmentTypes.length && e.instructions.length && !e.isCustom))
  await clickText('Add exercise from library')
  assert.equal(await evaluate(`document.querySelectorAll('.exercise-card').length`),24,'bounded initial rendering')
  await field('exerciseSearch','lat raise')
  assert.ok((await catalogIds()).includes('lateral-raise'))
  await field('exerciseSearch','chest machine')
  assert.ok((await catalogIds()).includes('machine-chest-press'))
  await field('exerciseSearch','tricep cable')
  assert.ok((await catalogIds()).includes('overhead-cable'))
  await clickText('Reset library filters')
  await field('equipmentFilter','smith'); await field('muscleSubgroup','upper-chest'); await field('exerciseType','compound'); await field('movementPattern','horizontal-push')
  assert.deepEqual(await catalogIds(),['smith-incline'])
  await click('[data-catalog-exercise="smith-incline"] .exercise-photo-open')
  await waitFor(()=>evaluate(`document.querySelectorAll('dialog animate').length>0`),'new schematic animation')
  await click('[aria-label="Close exercise details"]')
  await field('exerciseSearch','missing exercise')
  assert.deepEqual(await catalogIds(),[])
  await clickText('Create Custom Exercise'); await clickText('Cancel')
  await clickText('Create Custom Exercise')
  await field('customName','Panatta custom incline press')
  await field('customEquipment','plate-incline')
  await field('customMovement','horizontal-push')
  await field('customAliases','my chest machine, panatta press')
  await field('customNotes','Seat position 3')
  await clickText('Create exercise')
  const customId=(await catalogIds())[0]
  assert.ok(customId.startsWith('custom-'))
  await add(customId)
  await field('sets-'+customId,3); await field('reps-'+customId,8); await field('repsMax-'+customId,12); await field('weight-'+customId,30); await field('rest-'+customId,120)
  await field('repsMax-'+customId,7)
  assert.equal(await evaluate(`document.querySelector('#workout-plan-form').checkValidity()`),false,'invalid rep ranges rejected')
  await field('repsMax-'+customId,12)
  const beforeCustom=await stored()
  await evaluate(`window.__put=IDBObjectStore.prototype.put; IDBObjectStore.prototype.put=function(...args){if(this.name==='customExercises')throw new Error('Simulated custom exercise failure');return window.__put.apply(this,args)}`)
  await clickText('Save plan'); await waitText('Simulated custom exercise failure')
  assert.deepEqual(await stored(),beforeCustom,'custom exercise and plan save is atomic')
  await evaluate('IDBObjectStore.prototype.put=window.__put')
  await clickText('Save plan'); await waitText('Your plan, favorites and gym equipment are saved.')
  await reload('Your week. Your workout.'); await selectDay('Monday')
  assert.equal(await evaluate(`document.querySelector('.exercise-library').hidden`),true,'library stays out of the way initially')
  await call('Emulation.setDeviceMetricsOverride',{width:384,height:854,deviceScaleFactor:1,mobile:true})
  await evaluate('window.scrollTo(0,0)'); await snapshot('calm-workout-mobile')
  await evaluate(`document.querySelector('.day-plan').scrollIntoView()`); await snapshot('calm-day-mobile')
  assert.equal(await evaluate(`document.querySelector('[name="repsMax-${customId}"]').value`),'12')
  await clickText('Add exercise from library'); await field('exerciseSearch','panatta press')
  assert.deepEqual(await catalogIds(),[customId],'custom aliases persist')
  await click(`[data-catalog-exercise="${customId}"] .exercise-photo-open`)
  await waitText('Seat position 3'); await clickText('Edit custom exercise')
  await field('customNotes','Seat position 4'); await clickText('Apply exercise changes')
  await selectDay('Wednesday'); await clickText('Add exercise from library'); await field('exerciseSearch','panatta')
  await add(customId); await field('reps-'+customId,15); await field('weight-'+customId,20)
  await clickText('Save plan'); await waitText('Your plan, favorites and gym equipment are saved.')
  const customData=await evaluate(`import('/src/services/dataRepository.ts').then(async m=>await m.dataRepository.load())`)
  assert.equal(customData.customExercises.length,1)
  assert.equal(customData.customExercises[0].notes,'Seat position 4')
  assert.equal(customData.workoutPlan.days[0].exercises.find(e=>e.exerciseId===customId).weightKg,30)
  assert.equal(customData.workoutPlan.days[2].exercises.find(e=>e.exerciseId===customId).weightKg,20)
  assert.equal('sets' in customData.customExercises[0],false,'workout prescriptions do not belong to the exercise')
  for (const width of [320,384,768,1440]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<800})
    assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'),`extended library fits ${width}px`)
  }
  console.log(`PASS: ${catalog.length} exercises, metadata, aliases, combined filters, pagination, animations, rep ranges, custom exercise create/edit and atomic persistence`)
  await call('Emulation.setDeviceMetricsOverride', {width:384, height:854, deviceScaleFactor:1, mobile:true})
  console.log('PASS: editable split templates, day movement/rest, replacements, weights/rest, muscle metadata, legacy plans, day focus, gym filters, animated figures, pause/reduced motion, existing plans, favorites, plan editing, persistence, failure/retry and v2 migration')
}
