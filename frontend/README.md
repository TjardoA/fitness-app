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

### Workoutplanner

Workout gebruikt vijf datagedreven templates: Push/Pull/Legs (5 trainingsdagen), Upper/Lower (4), Full Body (3), Arnold Split (6) en Bro Split (5). De PPL-week is Push, Pull, Legs, Rest, Upper Body, Shoulders + Arms, Rest. De Upper-dag bevat vooral borst, rug en schouders; de aparte armdag bevat alle drie schouderdelen, biceps en triceps. Full Body gebruikt compounds zonder verplichte isolatie voor elke spiergroep. Alle templates openen in dezelfde editor.

Kies **Create your own plan** voor een lege week. Elke kalenderdag heeft een stabiele ID, naam, workout/rest-type, eigen spiergroepen en oefeningen. **Add training day** vult de geselecteerde rustdag of de eerste vrije rustdag. Verwijderen maakt die plek een lege rustdag; **Move day earlier/later** verplaatst de hele dag inclusief oefeningen. De week blijft maandag tot zondag. Een nieuwe template vervangt de editor na bevestiging wanneer er oefeningen staan; gymkeuzes en favorieten blijven behouden. Pas **Save plan** vervangt de opgeslagen versie.

De centrale catalogus bevat 223 oefeningen met primaire/secundaire spiergroepen, anatomische subgroepen, aliases, apparatuur, compound/isolation, bewegingspatroon, eenzijdigheid en korte aanwijzingen. De dagfilter gebruikt primaire spieren, zodat bijvoorbeeld indirecte tricepstraining niet alle borstpresses op een armdag laat verschijnen. Details tonen ook secundaire spieren. Voeg oefeningen toe, verwijder of vervang ze en bewerk volgorde, sets, reps (seconden bij plank), gewicht in kg en rust in seconden. Vervangen behoudt sets en rust; gewicht wordt leeg en bij een andere eenheid krijgt reps een passende startwaarde. Voorbeelden starten op 3 sets, 10 reps en 90 seconden rust; gewicht is leeg. Dit zijn bewerkbare startwaarden, geen persoonlijke aanbeveling.

**Save plan** bewaart schema, apparatuur en favorieten per account. Onopgeslagen wijzigingen gaan verloren bij navigatie naar een ander tabblad. Home toont het opgeslagen dagschema; geplande oefeningen zijn geen uitgevoerde trainingen.

De structuur is WorkoutSplit -> WorkoutDay -> doelspieren / PlannedExercise -> catalogusoefening plus sets, reps, weightKg en restSeconds. Templates staan in src/data/trainingSplits.ts, catalogus en spiermetadata in src/data/exercises.ts. Nieuwe templates gebruiken dezelfde UI; template-ID's worden niet als een vaste enum opgeslagen. WorkoutGenerationPreferences beschrijft de toekomstige invoer voor aanbevelingen (dagen, doel, ervaring, apparatuur, favorieten, uitsluitingen, tijd en prioriteitsspieren); automatische generatie is nog niet actief.

Opgeslagen plannen hebben schemaVersion 2. De parser leest eerdere weekplannen met behoud van volgorde, namen, oefeningen, sets, reps, gym en favorieten; gewicht krijgt null en rust 90 seconden. Oudere plannen worden pas opnieuw opgeslagen bij expliciet bewaren, nooit alleen door openen. Onleesbare data geeft een fout zonder overschrijven. IndexedDB-versie 4 voegt de accountgebonden customExercises-store toe; bestaande historie en plannen blijven intact.

Onder **My gym** kies je beschikbare apparatuur, inclusief specifieke machines. **My gym only** toont oefeningen waarvoor alle benodigde apparatuur is geselecteerd; bodyweight blijft beschikbaar. Verwijderen van apparatuur wist geen geplande oefeningen, maar toont een melding bij oefeningen die die apparatuur gebruiken. Favorieten, zoekveld en spiergroepfilter zijn combineerbaar.

Borstoefeningen tonen Upper chest, Mid / overall chest of Lower chest als nadruk. Bij Chest of een Push-dag kun je hierop filteren en zie je hoeveel oefeningen van elke categorie in je dag staan. Dit zijn overlappende nadruklabels, geen drie verplichte oefeningen of volledig afzonderlijke spieren. Achtergrond: [onderzoek naar bankhoek en spieractiviteit](https://pmc.ncbi.nlm.nih.gov/articles/PMC7579505/). De catalogus bevat 13 borstvarianten, met aparte apparatuurvereisten voor onder meer een declinebank, dubbele kabels en een chest-pressmachine.

De workoutpagina toont eerst de week en compacte oefeningregels. Schemakeuze, daginstellingen en voorschriften zijn inklapbaar. De bibliotheek opent via **Add exercise from library**; die actie wist de filters en geeft toegang tot de volledige catalogus. Alleen de eerste 24 resultaten worden getekend; **Show more exercises** toont de volgende reeks. Zoekwoorden worden los van volgorde, hoofdletters en leestekens gecombineerd met aliases. Extra filters staan ingeklapt en combineren spiergroep/subgroep, apparatuurtype, compound/isolation en bewegingspatroon. De spiergroepfilter kan ook secundaire spieren vinden; de dagfocus blijft op primaire spieren gebaseerd.

**Create Custom Exercise** maakt een eigen oefening met naam, primaire/secundaire spieren, apparatuur, type, patroon, aliases en notities. De gebruiker bewaart deze samen met het schema via **Save plan**: beide stores worden atomair geschreven. Details bieden **Edit custom exercise**. Iedere workout verwijst naar dezelfde ID, maar behoudt eigen sets, minimum/optioneel maximum reps, gewicht en rust. De opgeslagen definitie bevat geen workoutvoorschriften. Eigen oefeningen volgen accountisolatie en worden bij accountverwijdering mee gewist.

De poppetjes blijven stil in de kaarten en bewegen alleen in de geopende details. De 34 oorspronkelijke illustraties blijven behouden; de overige standaardbewegingen hebben schematische animaties per bewegingsfamilie, expliciet als zodanig gemarkeerd. Die illustreren de gewrichtsbeweging, niet elk specifiek machineontwerp. Isometrische oefeningen tonen een stilstaande houding. Een eigen, onbekende oefening heeft een neutrale placeholder totdat er een passende illustratie is. Animaties zijn pauzeerbaar en respecteren minder beweging. Alle beelden zijn lokaal getekende SVG's.

Uitbreiden: voeg een stabiele seed-ID in src/data/exerciseSeed.ts toe en verwijs vanuit templates naar diezelfde centrale ID. Taxonomie en apparatuurlabels staan los van de UI. De algemene [ACE-oefeningenbibliotheek](https://www.acefitness.org/resources/everyone/exercise-library/) is een aanvullende referentie; namen, metadata en schematische illustraties zijn lokaal samengesteld en vormen geen gekopieerde of volledige externe dataset. Spiersubgroepen zijn betrokkenheidslabels, geen garantie op selectieve isolatie.


De browser-smoketest omvat schemakeuze, trainingsfocus (ook Full arms), bewegende poppetjes, pauzeren en minder beweging, filters, planbewerking, opslagfouten en retry, accountisolatie, verwijderen en migratie van bestaande versie-2-databases. Uitvoeren met een Vite-server op poort 5174: `node scripts/browser-smoke.mjs`.

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
| `src/data/exercises.ts` | Oefeningencatalogus, apparatuurvereisten en lege weekplanner. |
| `src/pages/WorkoutPage.tsx` | Weekindeling, gymkeuzes, favorieten en oefeningengalerij. |

Een **hook** bundelt React-state en gedrag. Een **repository** verzorgt opslag buiten de components. Een **transaction** slaat meerdere wijzigingen samen op: als één onderdeel faalt, wordt geen deelresultaat opgeslagen. Een **interface** legt de vorm van gegevens en opslagfuncties vast. Later kan een ASP.NET Core-adapter de `DataRepository`-interface implementeren.

## Opslag en migratie

### Lokale accounts en uitloggen

Via **Profile → Sign out** kom je bij de accountkeuze. Je kunt een bestaand account openen of via **Create new account** een leeg profiel aanmaken. Uitloggen blijft na vernieuwen behouden en verwijdert geen gegevens. Onopgeslagen formulierwijzigingen worden niet bewaard.

Naast **Sign out** staat **Delete account**. Na bevestiging worden het account en alle bijbehorende lokale gegevens definitief gewist, inclusief eventuele oude voortgangsgegevens. Andere accounts blijven behouden. Ook na het verwijderen van het laatste account kun je een nieuw account aanmaken. Bij het verwijderen van het oorspronkelijke account wordt ook het oude fase-1-profiel verwijderd.

`src/services/accountStorage.ts` bewaart uitsluitend de accountlijst en het actieve account in `forma.accounts.v1` (localStorage). Het oorspronkelijke profiel blijft in database `forma`; elk extra account krijgt een eigen `forma-account-<id>` IndexedDB-database. `createDataRepository` bindt alle lees- en schrijfacties aan die database. Bestaande gebruikers worden automatisch geregistreerd zonder hun historie te verplaatsen. Onboarding geeft elk nieuw profiel een unieke ID.

Dit zijn lokale accounts zonder wachtwoord, serverauthenticatie of cloudsync. Iedereen met toegang tot deze browser kan een opgeslagen account selecteren.

IndexedDB-databases, versie 4 (bestaande stores blijven behouden bij de upgrade):

- `profiles`: volledig profiel met ingestelde targets.
- `weights`: losse metingen met datum en aanmaaktijd.
- `nutrition`: één dag per `YYYY-MM-DD`, met entries en een snapshot van de doelen.
- `workouts`: bestaande structuur, nog zonder registratiefunctie.
- `customExercises`: eigen oefeningdefinities per account, los van sets/reps/gewicht.
- `workoutPlans`: weekplanner, favoriete oefeningen en gymapparatuur per account (`weekly-plan`).
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
