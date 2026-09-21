# Forma — persoonlijke fitness-app

React + TypeScript, React Compiler, Vite en Tailwind CSS 4. Geen backend of externe API; alle gebruikersdata staat lokaal.

## Ontwikkelen

Vanuit `frontend`:

```sh
npm install
npm run dev
npm run build
npm run lint
```

## Fase 2: echte gebruikersdata

- Zonder volledig profiel verschijnt verplichte onboarding in vier stappen: personal, activity, goal en nutrition.
- De laatste stap laat BMR, onderhoud en bewerkbare calorie-/macrodoelen zien. Er worden geen persoonlijke gegevens vooraf verzonnen.
- Profile bewerkt alle gegevens. Alleen expliciet klikken op `Reset to recommended` vult nieuwe doelen in; `Save profile` slaat ze op.
- Nutrition ondersteunt toevoegen, bewerken, verplaatsen tussen maaltijden en verwijderen van voeding, per lokale kalenderdatum. De opgegeven voedingswaarden gelden voor de volledige portie. De tekst `200 g` vermenigvuldigt de waarden niet.
- Home gebruikt hetzelfde profiel, dezelfde voedingsdagen en dezelfde gewichtmetingen als de andere pagina's.
- Onboarding schrijft de eerste gewichtmeting. Een nieuwe weging (ook via Profile) voegt een record toe. Eerdere metingen blijven intact. Een teruggedateerde weging vervangt niet het huidige gewicht.
- Nieuwe kalenderdagen beginnen met nul inname. `useToday` controleert de lokale datum periodiek, bij terugkeer naar het venster en bij zichtbaarheid.
- Een grafiek verschijnt pas bij metingen op meerdere datums. Er is geen verzonnen workout- of progressiehistorie.

## Structuur en belangrijke bestanden

| Locatie | Verantwoordelijkheid |
| --- | --- |
| `src/App.tsx` | Laadt de gedeelde data, kiest onboarding of de actieve pagina. |
| `src/pages/OnboardingPage.tsx` | Vierstaps onboarding met bewerkbare aanbeveling voor opslaan. |
| `src/pages/ProfilePage.tsx` | Profiel en doelen bewerken; herberekening is altijd expliciet. |
| `src/pages/NutritionPage.tsx` | Voedingsdag, maaltijdgroepen, invoer en historie. |
| `src/pages/ProgressPage.tsx` | Gedateerde gewichtmetingen, echte trend en workout-history. |
| `src/pages/HomePage.tsx` | Samenvatting uit echte gedeelde state. |
| `src/components/` | Layout, profielvelden, targets, voedingsformulier en samenvatting. |
| `src/hooks/useAppData.ts` | Gedeelde React-state, opslaan en foutmeldingen. |
| `src/hooks/useToday.ts` | Lokale datum en dagwisseling. |
| `src/utils/nutrition.ts` | BMR, TDEE, aanbevolen doelen en totalen. |
| `src/utils/validation.ts` | Validatie bij de opslaggrens, naast HTML-formuliervalidatie. |
| `src/utils/profileForm.ts` | Tekstvelden omzetten naar gevalideerde TypeScript-modellen. |
| `src/services/dataRepository.ts` | IndexedDB lezen/schrijven, transacties en versie-upgrade. |
| `src/services/profileStorage.ts` | Alleen migratie van het beperkte fase-1-profiel uit localStorage. |
| `src/types/models.ts` | UserProfile, NutritionTargets, FoodEntry, NutritionDay, WeightEntry en Workout. |
| `src/data/workoutTemplates.ts` | Alleen oefeningssuggesties; geen persoonlijke prestaties. |

Een **hook** bundelt React-state en gedrag. Een **repository** verzorgt opslag buiten de components. Een **transaction** slaat meerdere wijzigingen samen op: als één onderdeel faalt, wordt geen deelresultaat opgeslagen. Een **interface** legt de vorm van gegevens en opslagfuncties vast. Later kan een ASP.NET Core-adapter de `DataRepository`-interface implementeren.

## Opslag en migratie

IndexedDB-database `forma`, versie 2:

- `profiles`: volledig profiel met ingestelde targets.
- `weights`: losse metingen met datum en aanmaaktijd.
- `nutrition`: één dag per `YYYY-MM-DD`, met entries en een snapshot van de doelen.
- `workouts`: bestaande structuur, nog zonder registratiefunctie.
- `progress`: behouden voor toekomstige lichaamsmetingen/fotoverwijzingen.

Onboarding bewaart profiel en eerste weging in één transactie. De interface meldt succes pas na het committen. Een eventuele fase-1-localStorage-entry (`forma.profile.v1`) blijft intact en vult alleen eerder ingevoerde naam, doel en trainingsfrequentie voor onboarding aan. Een leesfout leidt tot een foutscherm met retry; er wordt geen lege dataset over onleesbare data geschreven.

Profielwijzigingen passen doelen aan voor vandaag en toekomstige dagen. Bestaande oudere voedingsdagen behouden hun eigen targets. Bij de eerste invoer voor een nog lege historische datum worden de huidige doelen gebruikt; dit staat in de interface. Voedingsbewerkingen lezen de betreffende dag opnieuw binnen de schrijftransactie, zodat ze andere entries niet vervangen door verouderde UI-state.

Gegevens blijven na refresh en heropenen behouden op dezelfde browser/origin. Een andere poort is een andere origin. Verwijderen van browserdata verwijdert ook de lokale gegevens. Synchronisatie tussen apparaten, export/back-up en live synchronisatie tussen open tabbladen zijn nog niet toegevoegd.

## Berekeningen

Mifflin–St Jeor: `10 × kg + 6.25 × cm − 5 × leeftijd + 5` (male) of `− 161` (female).

- Activiteitsfactoren: 1.2, 1.375, 1.55 en 1.725; bedoeld als grove startinstelling.
- TDEE = BMR × activiteitsfactor. Trainingsdagen worden niet nogmaals meegeteld.
- Fat loss: 10% onder onderhoud; muscle gain: 5% erboven.
- Recomposition en maintain: onderhoud.
- Eiwit: 2 g/kg, of 1.6 g/kg voor maintain; vet: 30% van calorieën; koolhydraten: resterende energie.
- Afgeronde startschattingen voor volwassenen, geen medische metingen. Eigen calorieën en macro's kunnen onafhankelijk worden ingesteld; de UI laat zien wanneer de calorie-equivalenten sterk verschillen.

Bronnen: [Mifflin–St Jeor](https://pubmed.ncbi.nlm.nih.gov/2305711/) en [ISSN protein position stand](https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/). Activiteitsfactoren en doelpercentages zijn expliciete app-instellingen, niet rechtstreeks aanbevelingen uit deze papers.

## Browsercontrole

`node scripts/browser-smoke.mjs` test via het DevTools-protocol met Node 22 en lokaal geïnstalleerde Edge. Er zijn geen testlibraries toegevoegd. Start eerst Vite; de standaard test-URL is `http://localhost:5174`. Stel `FORMA_TEST_URL` in voor een andere poort of `BROWSER_PATH` voor een andere Chromium-browser.

De test gebruikt een nieuw tijdelijk browserprofiel en raakt je echte gegevens niet aan. Hij controleert onboarding, aangepaste doelen, herladen, volledig sluiten/heropenen van de browser, migratie vanuit fase 1, voedings-CRUD, gedeelde dashboardtotalen, gewichthistorie, teruggedateerde invoer, foutafhandeling bij opslag, formule-uitkomsten en lokale dagwisseling. Screenshots op mobiel en desktop komen in de genegeerde map `.test-artifacts`.

## Nog geen onderdeel van fase 2

Workouts tonen herkenbare templates, zonder vooraf ingevulde gewichten, PR's of voltooiingen. Sessies starten/afronden volgt later. AI Coach blijft een expliciete UI-preview zonder API. PWA-manifest, installatie-iconen en offline caching volgen eveneens later.
