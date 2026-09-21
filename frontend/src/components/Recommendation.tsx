import type { NutritionInputs } from '../utils/nutrition'
import { calculateRecommendation } from '../utils/nutrition'
import { activityOptions } from '../data/profileOptions'

export function Recommendation({ profile }: { profile: NutritionInputs }) {
  const estimate = calculateRecommendation(profile)
  return <div className="recommendation">
    <div className="grid grid-cols-2 gap-4">
      <div><p className="eyebrow">BMR ESTIMATE</p><strong>{estimate.bmr.toLocaleString('en-GB')} <small>kcal/day</small></strong></div>
      <div><p className="eyebrow">MAINTENANCE / TDEE</p><strong>{estimate.maintenance.toLocaleString('en-GB')} <small>kcal/day</small></strong></div>
    </div>
    <p className="muted text-sm mt-4">Starting estimates, not medical measurements. Review them against your energy, training and longer-term trends.</p>
    <details className="mt-3 text-sm"><summary>How these estimates work</summary><div className="formula-detail">
      <p>Mifflin–St Jeor estimates resting energy: 10 × weight (kg) + 6.25 × height (cm) − 5 × age {profile.sex === 'male' ? '+ 5' : '− 161'}.</p>
      <p>Maintenance = BMR × {estimate.multiplier} ({activityOptions[profile.activityLevel].label.toLowerCase()}). Activity factors are rough estimates, not measurements.</p>
      <p>Fat loss starts 10% below maintenance; muscle gain 5% above. Recomposition and maintenance start at maintenance. Recomposition pairs this with training and 2 g protein/kg, without an aggressive deficit.</p>
      <p>Protein starts at {profile.goal === 'maintenance' ? '1.6' : '2'} g/kg; fat at 30% of calories; carbohydrates use the remaining energy. Protein and carbohydrates contribute 4 kcal/g, fat 9 kcal/g. Values are rounded.</p>
      <p>Sources: <a href="https://pubmed.ncbi.nlm.nih.gov/2305711/" target="_blank" rel="noreferrer">Mifflin–St Jeor</a> and <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/" target="_blank" rel="noreferrer">ISSN protein position stand</a>. Goal adjustments are app starting settings, not prescriptions from these papers.</p>
    </div></details>
  </div>
}

