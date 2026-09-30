// Original vector poses: head, shoulder, hip, left elbow/hand, right elbow/hand,
// left knee/foot and right knee/foot. Equal point counts allow smooth interpolation.
import { exercises, type CatalogExercise } from './exercises'
export type Point = [number, number]
export type Pose = [Point, Point, Point, Point, Point, Point, Point, Point, Point, Point, Point]
export interface ExerciseMotion { from: Pose; to: Pose; apparatus?: 'bench' | 'incline' | 'seat' | 'pulldown' | 'row' | 'fly' | 'press' | 'extension' | 'curl' | 'bar' | 'decline' | 'cables' | 'chest-press' | 'calf'; cableAnchors?: [Point, Point]; singleLoad?: boolean; neutralGrip?: boolean; load?: 'dumbbells' | 'barbell' | 'cable' }
const standing: Pose = [[150,43],[150,72],[150,128],[127,103],[122,133],[173,103],[178,133],[132,162],[126,196],[168,162],[174,196]]
const seated: Pose = [[150,47],[150,77],[150,139],[123,103],[116,79],[177,103],[184,79],[127,153],[121,193],[173,153],[179,193]]
const lying: Pose = [[76,119],[100,131],[172,140],[115,103],[94,83],[123,109],[108,87],[204,157],[211,194],[197,163],[206,197]]
function pose(base: Pose, changes: Partial<Record<number, Point>>): Pose {
  return base.map((point, index) => changes[index] ?? point) as Pose
}
function shift(base: Pose, y: number): Pose { return base.map(([x, py]) => [x, py + y]) as Pose }
const squat = pose(standing, {0:[142,82],1:[145,109],2:[174,156],3:[121,128],4:[110,101],5:[169,128],6:[182,101],7:[120,156],8:[126,196],9:[190,165],10:[174,196]})
const squatUp = pose(standing, {3:[126,92],4:[110,64],5:[174,92],6:[190,64]})
const pushup: Pose = [[89,103],[108,122],[180,147],[104,160],[92,194],[120,163],[110,194],[217,171],[254,193],[213,177],[247,197]]
const plank = pose(pushup, {0:[89,124],1:[111,143],2:[181,163],3:[114,187],4:[83,190],5:[128,193],6:[98,196]})
const row: Pose = [[117,74],[134,98],[184,126],[135,139],[130,177],[166,126],[151,153],[199,165],[210,196],[153,163],[129,164]]
const legPress: Pose = [[93,110],[113,129],[145,170],[105,155],[118,170],[123,151],[135,169],[180,133],[201,100],[194,145],[215,109]]
const extension: Pose = [[117,48],[124,75],[136,135],[109,107],[112,139],[143,107],[150,139],[185,140],[190,190],[177,146],[180,196]]
const legCurl: Pose = [[79,117],[105,135],[174,141],[91,157],[69,157],[107,165],[89,172],[213,148],[244,183],[206,155],[236,190]]

export const exerciseMotions: Record<string, ExerciseMotion> = {
  'bench-press': { from: lying, to: pose(lying, {3:[100,90],4:[101,47],5:[113,92],6:[114,50]}), apparatus:'bench', load:'barbell' },
  'dumbbell-press': { from: lying, to: pose(lying, {3:[100,90],4:[101,47],5:[113,92],6:[114,50]}), apparatus:'bench', load:'dumbbells' },
  'incline-press': { from: pose(lying, {0:[97,75],1:[119,97],3:[100,110],4:[87,81],5:[134,119],6:[135,83]}), to: pose(lying, {0:[97,75],1:[119,97],3:[115,62],4:[114,24],5:[132,66],6:[136,31]}), apparatus:'incline', load:'dumbbells' },
  'chest-fly': { from: pose(seated, {3:[105,80],4:[100,48],5:[195,80],6:[200,48]}), to: pose(seated, {3:[135,91],4:[139,63],5:[165,91],6:[161,63]}), apparatus:'fly' },
  pushup: { from: pushup, to: pose(pushup, {0:[91,149],1:[112,163],2:[182,176],3:[77,169],5:[98,176],7:[218,184],9:[215,188]}) },
  'lat-pulldown': { from: pose(seated, {3:[121,45],4:[105,22],5:[179,45],6:[195,22]}), to: pose(seated, {3:[111,100],4:[100,76],5:[189,100],6:[200,76]}), apparatus:'pulldown' },
  'cable-row': { from: pose(seated, {0:[142,70],1:[151,96],2:[140,152],3:[190,104],4:[218,110],5:[191,113],6:[218,119],7:[183,167],8:[220,187],9:[178,178],10:[215,195]}), to: pose(seated, {0:[133,65],1:[144,93],2:[140,152],3:[120,120],4:[166,128],5:[132,129],6:[174,136],7:[183,167],8:[220,187],9:[178,178],10:[215,195]}), apparatus:'row', load:'cable' },
  'dumbbell-row': { from: row, to: pose(row, {3:[160,133],4:[138,130]}), apparatus:'bench', load:'dumbbells' },
  pullup: { from: pose(standing, {0:[150,79],1:[150,107],2:[150,158],3:[119,63],4:[102,25],5:[181,63],6:[198,25],7:[130,187],8:[143,211],9:[170,187],10:[158,211]}), to: pose(standing, {0:[150,27],1:[150,55],2:[150,111],3:[112,62],4:[102,25],5:[188,62],6:[198,25],7:[128,148],8:[143,176],9:[172,148],10:[158,176]}), apparatus:'bar' },
  'shoulder-press': { from: seated, to: pose(seated, {3:[129,48],4:[134,16],5:[171,48],6:[166,16]}), apparatus:'seat', load:'dumbbells' },
  'lateral-raise': { from: standing, to: pose(standing, {3:[111,81],4:[78,74],5:[189,81],6:[222,74]}), load:'dumbbells' },
  'bicep-curl': { from: standing, to: pose(standing, {4:[118,71],6:[182,71]}), load:'dumbbells' },
  'triceps-pushdown': { from: pose(standing, {3:[134,103],4:[122,80],5:[166,103],6:[178,80]}), to: pose(standing, {3:[134,103],4:[137,144],5:[166,103],6:[163,144]}), apparatus:'pulldown', load:'cable' },
  squat: { from: squatUp, to: squat, load:'barbell' },
  'leg-press': { from: legPress, to: pose(legPress, {7:[190,116],8:[230,64],9:[201,126],10:[241,74]}), apparatus:'press' },
  'leg-extension': { from: extension, to: pose(extension, {8:[232,135],10:[224,144]}), apparatus:'extension' },
  'leg-curl': { from: legCurl, to: pose(legCurl, {8:[213,103],10:[207,111]}), apparatus:'curl' },
  rdl: { from: pose(standing, {3:[131,103],4:[130,138],5:[169,103],6:[170,138]}), to: pose(standing, {0:[103,113],1:[128,123],2:[183,135],3:[126,152],4:[123,179],5:[147,152],6:[142,179],7:[146,167],9:[184,169]}), load:'barbell' },
  'calf-raise': { from: standing, to: pose(shift(standing,-10), {8:[126,196],10:[174,196]}), apparatus:'calf' },
  plank: { from: plank, to: plank },
}

// Variations retain their own apparatus, movement direction and hand attachments.
exerciseMotions['incline-barbell-press'] = { ...exerciseMotions['incline-press'], load: 'barbell' }
exerciseMotions['decline-dumbbell-press'] = {
  from: pose(lying, {0:[73,150],1:[99,150],2:[174,127],3:[104,115],4:[92,95],5:[120,119],6:[110,96],7:[213,124],8:[228,153],9:[206,130],10:[222,163]}),
  to: pose(lying, {0:[73,150],1:[99,150],2:[174,127],3:[100,108],4:[99,67],5:[111,108],6:[111,67],7:[213,124],8:[228,153],9:[206,130],10:[222,163]}), apparatus:'decline', load:'dumbbells',
}
exerciseMotions['dumbbell-fly'] = {
  from: pose(lying, {3:[68,106],4:[45,83],5:[145,108],6:[174,83]}),
  to: pose(lying, {3:[91,86],4:[98,57],5:[115,90],6:[113,61]}), apparatus:'bench', load:'dumbbells',
}
exerciseMotions['incline-dumbbell-fly'] = {
  from: pose(exerciseMotions['incline-press'].from, {3:[89,82],4:[61,61],5:[155,85],6:[181,64]}),
  to: pose(exerciseMotions['incline-press'].to, {3:[111,63],4:[115,34],5:[134,68],6:[132,38]}), apparatus:'incline', load:'dumbbells',
}
exerciseMotions['cable-fly'] = {
  from: pose(standing, {3:[108,81],4:[72,89],5:[192,81],6:[228,89]}),
  to: pose(standing, {3:[130,91],4:[143,97],5:[170,91],6:[157,97]}), apparatus:'cables', cableAnchors:[[42,83],[258,83]], load:'cable',
}
exerciseMotions['low-high-fly'] = {
  from: pose(standing, {3:[112,105],4:[82,135],5:[188,105],6:[218,135]}),
  to: pose(standing, {3:[128,72],4:[143,52],5:[172,72],6:[157,52]}), apparatus:'cables', cableAnchors:[[42,185],[258,185]], load:'cable',
}
exerciseMotions['high-low-fly'] = {
  from: pose(standing, {3:[110,71],4:[80,51],5:[190,71],6:[220,51]}),
  to: pose(standing, {3:[128,110],4:[143,140],5:[172,110],6:[157,140]}), apparatus:'cables', cableAnchors:[[42,30],[258,30]], load:'cable',
}
exerciseMotions['machine-chest-press'] = {
  from: pose(seated, {3:[112,101],4:[115,78],5:[188,101],6:[185,78]}),
  to: pose(seated, {3:[128,91],4:[139,68],5:[172,91],6:[161,68]}), apparatus:'chest-press',
}
exerciseMotions['hammer-curl'] = { ...exerciseMotions['bicep-curl'], neutralGrip:true }
exerciseMotions['overhead-triceps'] = {
  from: pose(standing, {3:[132,28],4:[141,60],5:[168,28],6:[159,60]}),
  to: pose(standing, {3:[136,28],4:[142,13],5:[164,28],6:[158,13]}), load:'dumbbells', singleLoad:true,
}
exerciseMotions['face-pull'] = {
  from: pose(standing, {3:[134,87],4:[143,91],5:[166,87],6:[157,91]}),
  to: pose(standing, {3:[107,79],4:[116,47],5:[193,79],6:[184,47]}), apparatus:'cables', cableAnchors:[[150,30],[150,30]], load:'cable',
}
exerciseMotions['goblet-squat'] = {
  from: pose(standing, {3:[128,105],4:[142,83],5:[172,105],6:[158,83]}),
  to: pose(squat, {3:[124,139],4:[137,120],5:[166,139],6:[153,120]}), load:'dumbbells', singleLoad:true, neutralGrip:true,
}
exerciseMotions['chest-supported-row'] = {
  from: pose(row, {0:[120,77],1:[140,103],2:[182,148],3:[142,137],4:[145,177],5:[155,141],6:[161,178],7:[191,172],8:[206,199],9:[169,174],10:[161,199]}),
  to: pose(row, {0:[120,77],1:[140,103],2:[182,148],3:[163,127],4:[140,125],5:[177,135],6:[153,132],7:[191,172],8:[206,199],9:[169,174],10:[161,199]}), apparatus:'incline', load:'dumbbells',
}
exerciseMotions['rear-delt-fly'] = {
  from: pose(row, {3:[119,140],4:[108,172],5:[141,144],6:[132,177],7:[188,169],8:[200,199],9:[163,174],10:[151,199]}),
  to: pose(row, {3:[95,90],4:[62,81],5:[172,111],6:[205,111],7:[188,169],8:[200,199],9:[163,174],10:[151,199]}), load:'dumbbells',
}

// Schematic movement families for the extended catalog. These show the joint
// action; machine geometry and exact setup vary. Original detailed poses stay intact.
const hipBridge: Pose = [[62,173],[85,184],[155,185],[111,190],[134,195],[114,198],[137,202],[197,141],[229,195],[186,148],[218,201]]
const dip: Pose = [[150,35],[150,61],[150,113],[115,96],[109,130],[185,96],[191,130],[130,151],[148,184],[169,153],[155,189]]
const lunge: Pose = [[150,68],[150,95],[150,143],[126,117],[116,147],[174,117],[184,147],[109,149],[94,193],[186,176],[211,194]]
const floor: Pose = [[70,160],[93,174],[160,184],[100,143],[88,121],[117,146],[106,124],[194,170],[228,191],[190,178],[222,199]]
function schematic(e: CatalogExercise): ExerciseMotion {
  const name = e.id
  let base: ExerciseMotion
  if (e.unit === 'sec') {
    const hold = name.includes('plank') ? plank : name.includes('hang') ? exerciseMotions.pullup.from : standing
    base = {from:hold,to:hold, apparatus:name.includes('hang')?'bar':undefined}
  } else if (/wrist/.test(name)) base = {from:pose(seated,{3:[126,119],4:[108,132],5:[174,119],6:[192,132]}),to:pose(seated,{3:[126,119],4:[104,110],5:[174,119],6:[196,110]}),apparatus:'seat'}
  else if (/thrust|bridge/.test(name)) base = {from:hipBridge,to:pose(hipBridge,{2:[151,144],7:[197,140],9:[186,147]}),apparatus:name.includes('thrust')?'bench':undefined}
  else if (/pullover|straight-arm-pulldown/.test(name)) base = {from:pose(standing,{3:[128,56],4:[121,26],5:[172,56],6:[179,26]}),to:pose(standing,{3:[129,106],4:[128,145],5:[171,106],6:[172,145]})}
  else if (/dip/.test(name)) base = {from:dip,to:pose(dip,{0:[150,67],1:[150,93],2:[150,145],3:[109,103],5:[191,103],7:[130,179],8:[148,208],9:[169,178],10:[155,210]}),apparatus:'bar'}
  else if (/shrug/.test(name)) base = {from:standing,to:pose(standing,{1:[150,64],3:[127,95],4:[122,125],5:[173,95],6:[178,125]})}
  else if (e.primaryMuscle==='calves') base=exerciseMotions['calf-raise']
  else if (e.primaryMuscle==='hamstrings' && e.movementPattern==='curl') base=name.includes('seated')?{from:exerciseMotions['leg-extension'].to,to:extension,apparatus:'extension'}:exerciseMotions['leg-curl']
  else if (e.primaryMuscle==='quads' && e.movementPattern==='extension') base=exerciseMotions['leg-extension']
  else if (e.primaryMuscle==='glutes' && e.movementPattern==='extension') base={from:standing,to:pose(standing,{9:[191,144],10:[217,169]})}
  else if (e.primaryMuscle==='hip-flexors') base={from:standing,to:pose(standing,{7:[115,129],8:[115,167]})}
  else if (e.primaryMuscle==='core') {
    if (/hang|captains/.test(name)) base={from:exerciseMotions.pullup.from,to:pose(exerciseMotions.pullup.from,{7:[119,157],8:[90,154],9:[130,163],10:[102,161]}),apparatus:'bar'}
    else if (e.movementPattern==='rotation') base={from:pose(standing,{3:[104,91],4:[78,113],5:[125,94],6:[91,120]}),to:pose(standing,{3:[175,94],4:[209,120],5:[196,91],6:[222,113]})}
    else if (/rollout|ab-wheel/.test(name)) base={from:pose(floor,{0:[121,90],1:[141,116],2:[180,150],3:[110,149],4:[85,190],5:[126,156],6:[96,197]}),to:pose(floor,{0:[74,127],1:[100,148],2:[179,171],3:[75,165],4:[47,191],5:[89,174],6:[61,199]})}
    else base={from:floor,to:pose(floor,{0:[90,112],1:[112,143],3:[109,115],4:[100,94],5:[131,126],6:[126,105]})}
  } else switch (e.movementPattern) {
    case 'horizontal-push': base = name.includes('pushup')?exerciseMotions.pushup:name.includes('incline')?exerciseMotions['incline-press']:name.includes('decline')?exerciseMotions['decline-dumbbell-press']:e.equipmentTypes.includes('selectorized')||e.equipmentTypes.includes('plate-loaded')?exerciseMotions['machine-chest-press']:e.equipmentTypes.includes('cable')?{from:pose(standing,{3:[110,94],4:[123,86],5:[190,94],6:[177,86]}),to:pose(standing,{3:[134,97],4:[144,111],5:[166,97],6:[156,111]}),apparatus:'cables'}:exerciseMotions['bench-press']; break
    case 'vertical-push': base=exerciseMotions['shoulder-press'];break
    case 'horizontal-pull': base=/barbell|pendlay|meadows/.test(name)?{...exerciseMotions['chest-supported-row'],apparatus:undefined}:exerciseMotions['cable-row'];break
    case 'vertical-pull': base=name.includes('pullup')||name.includes('chinup')?exerciseMotions.pullup:exerciseMotions['lat-pulldown'];break
    case 'squat': base=name.includes('leg-press')?exerciseMotions['leg-press']:exerciseMotions.squat;break
    case 'hinge': base=exerciseMotions.rdl;break
    case 'lunge': base={from:standing,to:lunge};break
    case 'curl': base=exerciseMotions['bicep-curl'];break
    case 'extension': base=/overhead|skull/.test(name)?exerciseMotions['overhead-triceps']:exerciseMotions['triceps-pushdown'];break
    case 'raise': base=name.includes('front')?{from:standing,to:pose(standing,{3:[125,78],4:[105,63],5:[175,78],6:[195,63]})}:exerciseMotions['lateral-raise'];break
    case 'fly': base=e.primaryMuscle==='rear-delts'?exerciseMotions['rear-delt-fly']:exerciseMotions['cable-fly'];break
    case 'abduction': base={from:standing,to:pose(standing,{9:[195,153],10:[226,179]})};break
    case 'adduction': base={from:pose(standing,{9:[195,153],10:[226,179]}),to:standing};break
    default: base={from:standing,to:standing}
  }
  const load = e.equipment.includes('dumbbells')?'dumbbells':e.equipment.includes('barbell')||e.equipment.includes('ez-bar')||e.equipment.includes('smith')?'barbell':undefined
  return {...base,load, cableAnchors:undefined}
}
export const schematicExerciseIds = new Set<string>()
for (const exercise of exercises) {
  if (!exerciseMotions[exercise.id]) { exerciseMotions[exercise.id]=schematic(exercise); schematicExerciseIds.add(exercise.id) }
}
