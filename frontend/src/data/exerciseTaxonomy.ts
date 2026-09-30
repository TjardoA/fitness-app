import type { TargetMuscle } from '../types/models'
export const equipmentTypeLabels = {
  "barbell": "Barbell",
  "dumbbell": "Dumbbell",
  "cable": "Cable",
  "selectorized": "Selectorized machine",
  "plate-loaded": "Plate loaded machine",
  "smith": "Smith machine",
  "bodyweight": "Bodyweight",
  "assisted": "Assisted bodyweight",
  "band": "Resistance band",
  "kettlebell": "Kettlebell",
  "ez-bar": "EZ bar",
  "trap-bar": "Trap bar",
  "medicine-ball": "Medicine ball",
  "bench": "Bench",
  "pullup-bar": "Pull-up bar",
  "dip-station": "Dip station",
  "landmine": "Landmine",
  "suspension": "Suspension trainer",
  "other": "Other"
} as const
export type EquipmentType = keyof typeof equipmentTypeLabels
export const muscleSubgroups = {
  "upper-chest": {
    "label": "Upper chest",
    "muscle": "chest"
  },
  "mid-chest": {
    "label": "Mid chest",
    "muscle": "chest"
  },
  "lower-chest": {
    "label": "Lower chest",
    "muscle": "chest"
  },
  "lats": {
    "label": "Lats",
    "muscle": "back"
  },
  "upper-back": {
    "label": "Upper back",
    "muscle": "back"
  },
  "traps": {
    "label": "Traps",
    "muscle": "back"
  },
  "rhomboids": {
    "label": "Rhomboids",
    "muscle": "back"
  },
  "lower-back": {
    "label": "Lower back",
    "muscle": "back"
  },
  "front-delts": {
    "label": "Front delts",
    "muscle": "front-delts"
  },
  "side-delts": {
    "label": "Side delts",
    "muscle": "side-delts"
  },
  "rear-delts": {
    "label": "Rear delts",
    "muscle": "rear-delts"
  },
  "biceps-long-head": {
    "label": "Biceps long head",
    "muscle": "biceps"
  },
  "biceps-short-head": {
    "label": "Biceps short head",
    "muscle": "biceps"
  },
  "brachialis": {
    "label": "Brachialis",
    "muscle": "biceps"
  },
  "brachioradialis": {
    "label": "Brachioradialis",
    "muscle": "biceps"
  },
  "triceps-long-head": {
    "label": "Triceps long head",
    "muscle": "triceps"
  },
  "triceps-lateral-head": {
    "label": "Triceps lateral head",
    "muscle": "triceps"
  },
  "triceps-medial-head": {
    "label": "Triceps medial head",
    "muscle": "triceps"
  },
  "wrist-flexors": {
    "label": "Wrist flexors",
    "muscle": "forearms"
  },
  "wrist-extensors": {
    "label": "Wrist extensors",
    "muscle": "forearms"
  },
  "grip-forearms": {
    "label": "Grip / forearms",
    "muscle": "forearms"
  },
  "rectus-femoris": {
    "label": "Rectus femoris",
    "muscle": "quads"
  },
  "vastus-lateralis": {
    "label": "Vastus lateralis",
    "muscle": "quads"
  },
  "vastus-medialis": {
    "label": "Vastus medialis",
    "muscle": "quads"
  },
  "vastus-intermedius": {
    "label": "Vastus intermedius",
    "muscle": "quads"
  },
  "biceps-femoris": {
    "label": "Biceps femoris",
    "muscle": "hamstrings"
  },
  "semitendinosus": {
    "label": "Semitendinosus",
    "muscle": "hamstrings"
  },
  "semimembranosus": {
    "label": "Semimembranosus",
    "muscle": "hamstrings"
  },
  "gluteus-maximus": {
    "label": "Gluteus maximus",
    "muscle": "glutes"
  },
  "gluteus-medius": {
    "label": "Gluteus medius",
    "muscle": "glutes"
  },
  "gluteus-minimus": {
    "label": "Gluteus minimus",
    "muscle": "glutes"
  },
  "gastrocnemius": {
    "label": "Gastrocnemius",
    "muscle": "calves"
  },
  "soleus": {
    "label": "Soleus",
    "muscle": "calves"
  },
  "rectus-abdominis": {
    "label": "Rectus abdominis",
    "muscle": "core"
  },
  "obliques": {
    "label": "Obliques",
    "muscle": "core"
  },
  "transverse-abdominis": {
    "label": "Transverse abdominis",
    "muscle": "core"
  },
  "hip-adductors": {
    "label": "Hip adductors",
    "muscle": "adductors"
  },
  "hip-abductors": {
    "label": "Hip abductors",
    "muscle": "abductors"
  },
  "hip-flexors": {
    "label": "Hip flexors",
    "muscle": "hip-flexors"
  },
  "erector-spinae": {
    "label": "Erector spinae",
    "muscle": "erectors"
  },
  "neck": {
    "label": "Neck",
    "muscle": "neck"
  }
} as const satisfies Record<string, {label:string; muscle:TargetMuscle}>
export type MuscleSubgroup = keyof typeof muscleSubgroups
export const movementLabels = {
  "horizontal-push": "Horizontal push",
  "vertical-push": "Vertical push",
  "horizontal-pull": "Horizontal pull",
  "vertical-pull": "Vertical pull",
  "squat": "Squat",
  "hinge": "Hinge",
  "lunge": "Lunge",
  "curl": "Curl",
  "extension": "Extension",
  "raise": "Raise",
  "fly": "Fly",
  "carry": "Carry",
  "core": "Core",
  "adduction": "Adduction",
  "abduction": "Abduction",
  "rotation": "Rotation",
  "other": "Other"
} as const
export type MovementPattern = keyof typeof movementLabels
export const exerciseTypeLabels = {compound:'Compound', isolation:'Isolation'} as const
export type ExerciseType = keyof typeof exerciseTypeLabels
