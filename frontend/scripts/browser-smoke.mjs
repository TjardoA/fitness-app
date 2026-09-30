// No test dependency required: Node 22 + Edge/Chrome, using the DevTools protocol.
// Run with a Vite server: node scripts/browser-smoke.mjs
// Optional: FORMA_TEST_URL, BROWSER_PATH. A fresh temporary browser profile protects real data.
import assert from 'node:assert/strict'
import { checkWorkoutPlanner } from './workout-checks.mjs'
import { spawn } from 'node:child_process'
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const base = process.env.FORMA_TEST_URL ?? 'http://localhost:5174'
const browserPath = process.env.BROWSER_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const userData = await mkdtemp(join(tmpdir(), 'forma-browser-test-'))
const artifacts = resolve('.test-artifacts')
await mkdir(artifacts, { recursive: true })
function launchBrowser() {
  return spawn(browserPath, ['--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=0', `--user-data-dir=${userData}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' })
}
let browser = launchBrowser()
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
let socket
let id = 0
const pending = new Map()
const exceptions = []
async function waitFor(check, label, timeout = 12000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (await check()) return
    await pause(80)
  }
  throw new Error(`Timed out: ${label}`)
}
function call(method, params = {}) {
  return new Promise((resolve, reject) => {
    const current = ++id
    pending.set(current, { resolve, reject })
    socket.send(JSON.stringify({ id: current, method, params }))
  })
}
async function evaluate(expression) {
  const response = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text)
  return response.result.value
}
const hasText = text => evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`)
const waitText = text => waitFor(() => hasText(text), text)
async function field(name, value) {
  await evaluate(`(() => {
    const input = document.querySelector('[name="${name}"]');
    if (!input) throw new Error('Missing field ${name}');
    const proto = input instanceof HTMLSelectElement ? HTMLSelectElement.prototype : input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, ${JSON.stringify(String(value))});
    input.dispatchEvent(new Event('input', {bubbles:true}));
    input.dispatchEvent(new Event('change', {bubbles:true}));
  })()`)
}
async function clickText(text) {
  await evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find(button => {
      const copy = button.cloneNode(true);
      copy.querySelectorAll('[aria-hidden="true"]').forEach(node => node.remove());
      return copy.textContent.trim() === ${JSON.stringify(text)};
    });
    if (!button) throw new Error('Missing button: ${text}');
    button.click();
  })()`)
}
async function submit() { await evaluate('document.querySelector("form").requestSubmit()') }
async function route(route, title) {
  await evaluate(`location.hash = '/${route}'`)
  await waitText(title)
}
async function reload(title) { await call('Page.reload'); await pause(200); await waitText(title) }
async function fillFood(name, calories = 330, protein = 62, carbs = 0, fat = 7) {
  await field('foodName', name); await field('serving', '200 g')
  await field('calories', calories); await field('protein', protein)
  await field('carbohydrates', carbs); await field('fat', fat)
}
async function snapshot(name) {
  const result = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  await writeFile(join(artifacts, name + '.png'), Buffer.from(result.data, 'base64'))
}

async function connect() {
  let port
  await waitFor(async () => {
    try {
      port = (await readFile(join(userData, 'DevToolsActivePort'), 'utf8')).split('\n')[0]
      return (await fetch(`http://localhost:${port}/json/list`)).ok
    }
    catch { return false }
  }, 'browser launch')
  const pages = await fetch(`http://localhost:${port}/json/list`).then(response => response.json())
  socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl)
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }))
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails)
    if (!message.id) return
    const request = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) request.reject(new Error(message.error.message))
    else request.resolve(message.result)
  })
  await call('Page.enable'); await call('Runtime.enable')
}
try {
  await connect()
  await call('Emulation.setDeviceMetricsOverride', { width: 384, height: 854, deviceScaleFactor: 1, mobile: true })
  await call('Page.addScriptToEvaluateOnNewDocument', { source: `
    const RealDate = Date;
    window.__testNow = null;
    window.Date = class extends RealDate {
      constructor(...args) { if (args.length) super(...args); else super(window.__testNow ?? RealDate.now()); }
      static now() { return window.__testNow ?? RealDate.now(); }
    };
  ` })
  await call('Page.navigate', { url: base + '/#/nutrition' })
  await waitText('Step 1')
  await submit(); assert.ok(await hasText('Step 1'), 'empty onboarding cannot advance')
  await field('name', 'Tjardo'); await field('age', 30); await field('sex', 'male')
  await field('heightCm', 180); await field('weightKg', 80)
  await submit(); await waitText('Step 2')
  await evaluate(`document.querySelector('input[value="moderate"]').click()`)
  await field('trainingDaysPerWeek', 4)
  await submit(); await waitText('Step 3')
  await evaluate(`document.querySelector('input[value="recomposition"]').click()`)
  await submit(); await waitText('Step 4')
  assert.equal(await evaluate(`document.querySelector('[name="calories"]').value`), '2759')
  await field('calories', 2400)
  await snapshot('onboarding-mobile')
  await submit(); await waitText('Tjardo.')
  assert.ok(await hasText('No meals logged yet.'))
  assert.ok(await hasText('No workout completed today.'))
  assert.ok(await hasText('80'))
  await reload('Tjardo.')
  await snapshot('home-mobile')
  assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'mobile page must not overflow')
  console.log('PASS: empty onboarding, recommendation, custom targets, initial weight, reload and mobile width')
  await checkWorkoutPlanner({ evaluate, route, field, clickText, waitText, reload, snapshot, call, waitFor })

  await route('nutrition', 'Fuel your everyday.')
  await clickText('+ Add food'); await fillFood('Chicken breast')
  await field('mealType', 'lunch'); await submit(); await waitText('Food saved.')
  assert.ok(await hasText('330 / 2,400 kcal'))
  assert.ok(await hasText('62 / 160 g'))
  await route('home', 'Tjardo.'); assert.ok(await hasText('330'))
  await route('nutrition', 'Fuel your everyday.')
  await clickText('Edit'); await field('calories', 440); await field('protein', 80)
  await field('mealType', 'dinner'); await submit(); await waitFor(() => hasText('440 / 2,400 kcal'), 'edit totals')
  assert.equal(await evaluate(`document.querySelector('.food-list li').closest('section').querySelector('h2').textContent`), 'Dinner')
  await reload('Fuel your everyday.'); assert.ok(await hasText('440 / 2,400 kcal'))
  await clickText('Delete'); await clickText('Confirm delete'); await waitText('Food deleted.')
  assert.ok(await hasText('0 / 2,400 kcal'))
  console.log('PASS: food create, edit, move meal, delete, shared Home totals and persistence')

  await route('profile', 'Make it personal.')
  await field('weightKg', 81)
  assert.equal(await evaluate(`document.querySelector('[name="calories"]').value`), '2400')
  await submit(); await waitText('Profile saved.')
  await reload('Make it personal.')
  assert.equal(await evaluate(`document.querySelector('[name="weightKg"]').value`), '81')
  assert.equal(await evaluate(`document.querySelector('[name="calories"]').value`), '2400')
  await clickText('Reset to recommended')
  assert.notEqual(await evaluate(`document.querySelector('[name="calories"]').value`), '2400')
  await reload('Make it personal.')
  assert.equal(await evaluate(`document.querySelector('[name="calories"]').value`), '2400', 'unsaved reset must not change storage')
  await route('progress', 'Every little win.')
  assert.ok(await hasText('80 kg')); assert.ok(await hasText('81 kg'))
  assert.ok(await hasText('Add more weigh-ins to see your trend.'))
  await field('weightKg', 82); await submit(); await waitText('Weigh-in saved.')
  const yesterday = await evaluate(`(() => { const day = new Date(); day.setDate(day.getDate()-1); return import('/src/utils/dates.ts').then(m => m.localDate(day)); })()`)
  await field('date', yesterday); await field('weightKg', 79); await submit()
  await waitFor(() => hasText('79 kg'), 'historical weigh-in')
  await route('profile', 'Make it personal.')
  assert.equal(await evaluate(`document.querySelector('[name="weightKg"]').value`), '82', 'backdated weigh-in must not replace latest weight')
  assert.equal(await evaluate(`document.querySelector('[name="calories"]').value`), '2400')
  console.log('PASS: editing profile preserves targets, reset needs save, weight history is append-only')

  await route('nutrition', 'Fuel your everyday.')
  await evaluate(`(() => { const input = document.querySelector('[aria-label="Food diary date"]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '${yesterday}'); input.dispatchEvent(new Event('input', {bubbles:true})); })()`)
  await clickText('+ Add food'); await fillFood('Yesterday oats', 200, 10, 30, 4)
  await submit(); await waitText('Food saved.')
  await clickText('Back to today'); assert.ok(await hasText('0 / 2,400 kcal'))
  await clickText('+ Add food'); await fillFood('Today rice', 300, 6, 60, 2)
  // An unavailable storage backend must not report success or discard the form.
  await evaluate(`window.__open = IDBFactory.prototype.open; IDBFactory.prototype.open = () => { throw new Error('Simulated storage failure') }`)
  await submit(); await waitText('Simulated storage failure')
  assert.equal(await evaluate(`document.querySelector('[name="foodName"]').value`), 'Today rice')
  await evaluate('IDBFactory.prototype.open = window.__open')
  await submit(); await waitText('Food saved.')
  assert.ok(await hasText('300 / 2,400 kcal'))
  await snapshot('nutrition-mobile')
  console.log('PASS: per-date history, empty today, storage failure and retry')

  // Calculate and validate in the real browser using the same modules as the UI.
  const formulas = await evaluate(`(async () => {
    const {calculateRecommendation, totalNutrition} = await import('/src/utils/nutrition.ts');
    const {validTargets, validFood} = await import('/src/utils/validation.ts');
    const base = {age:30,sex:'male',heightCm:180,weightKg:80,activityLevel:'moderate',goal:'recomposition'};
    return {male:calculateRecommendation(base),female:calculateRecommendation({...base,sex:'female'}),
      loss:calculateRecommendation({...base,goal:'fat-loss'}),gain:calculateRecommendation({...base,goal:'muscle-gain'}),
      empty:totalNutrition([]),invalidTargets:validTargets({calories:NaN,protein:0,carbohydrates:0,fat:0}),
      invalidFood:validFood({id:'x',name:'Food',serving:'100g',mealType:'lunch',calories:-1,protein:0,carbohydrates:0,fat:0})};
  })()`)
  assert.equal(formulas.male.bmr, 1780)
  assert.equal(formulas.female.bmr, 1614)
  assert.equal(formulas.loss.targets.calories, Math.round(2759 * .9))
  assert.equal(formulas.gain.targets.calories, Math.round(2759 * 1.05))
  assert.deepEqual(formulas.empty, { calories: 0, protein: 0, carbohydrates: 0, fat: 0 })
  assert.equal(formulas.invalidTargets, false); assert.equal(formulas.invalidFood, false)

  await evaluate(`(() => { const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1); window.__testNow = tomorrow.getTime(); window.dispatchEvent(new Event('focus')); })()`)
  await waitFor(() => hasText('0 / 2,400 kcal'), 'new local day')
  assert.ok(await hasText('No meals logged yet'))
  await reload('Fuel your everyday.') // Return to actual date, without removing stored days.
  assert.ok(await hasText('300 / 2,400 kcal'))
  // Editing today's target must not rewrite yesterday's snapshot or today's entries.
  await route('profile', 'Make it personal.'); await field('calories', 2500)
  await submit(); await waitText('Profile saved.')
  const history = await evaluate(`import('/src/services/dataRepository.ts').then(m => m.dataRepository.load())`)
  assert.equal(history.nutrition.find(day => day.date === yesterday).targets.calories, 2400)
  assert.equal(history.nutrition.find(day => day.date !== yesterday).targets.calories, 2500)
  assert.equal(history.nutrition.find(day => day.date !== yesterday).entries.length, 1)
  await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await route('home', 'Tjardo.'); await snapshot('home-desktop')
  assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'desktop page must not overflow')
  assert.equal(exceptions.length, 0, JSON.stringify(exceptions))
  console.log('PASS: formula fixtures, invalid inputs, midnight rollover, retained history, desktop width, no browser exceptions')

  // Close the browser process, then reopen the same isolated disk profile.
  const closed = new Promise(resolve => socket.addEventListener('close', resolve, { once: true }))
  await call('Browser.close'); await closed
  await pause(500)
  browser = launchBrowser()
  await connect()
  await call('Page.navigate', { url: base + '/#/nutrition' })
  await waitText('Fuel your everyday.')
  assert.ok(await hasText('300 / 2,500 kcal'))
  await route('profile', 'Make it personal.')
  assert.equal(await evaluate(`document.querySelector('[name="name"]').value`), 'Tjardo')
  assert.equal(await evaluate(`document.querySelector('[name="weightKg"]').value`), '82')
  console.log('PASS: profile and food persist after closing and reopening the browser')

  await evaluate("localStorage.removeItem('forma.accounts.v1')")
  await reload('Make it personal.')
  assert.equal(await evaluate(`document.querySelector('[name="weightKg"]').value`), '82', 'existing account migration preserves its profile')
  await clickText('Sign out'); await waitText('Your space is waiting.')
  await reload('Your space is waiting.')
  await evaluate("location.hash = '/nutrition'")
  assert.ok(await hasText('Your space is waiting.'), 'routes must stay gated while signed out')
  await clickText('Create new account'); await waitText('Step 1')
  assert.equal(await evaluate(`document.querySelector('[name="name"]').value`), '')
  await clickText('← Back to accounts'); await waitText('Your space is waiting.')
  await clickText('Create new account'); await waitText('Step 1')
  await field('name', 'Second account'); await field('age', 28); await field('sex', 'female')
  await field('heightCm', 170); await field('weightKg', 66)
  await submit(); await waitText('Step 2')
  await evaluate(`document.querySelector('input[value="light"]').click()`)
  await field('trainingDaysPerWeek', 2); await submit(); await waitText('Step 3')
  await evaluate(`document.querySelector('input[value="maintenance"]').click()`)
  await submit(); await waitText('Step 4'); await field('calories', 1900)
  await submit(); await waitText('Second account.')
  await route('workout', 'Your week. Your workout.')
  assert.equal(await evaluate(`document.querySelectorAll('.planned-exercises > li').length`), 0, 'new accounts start with an empty workout plan')
  const secondPlan = await evaluate(`(async () => {
    const session = JSON.parse(localStorage.getItem('forma.accounts.v1'));
    const account = session.accounts.find(item => item.id === session.activeId);
    const {createDataRepository} = await import('/src/services/dataRepository.ts');
    return (await createDataRepository(account.databaseName).load()).workoutPlan;
  })()`)
  assert.deepEqual(secondPlan.favorites, [])
  assert.deepEqual(secondPlan.equipment, [])
  assert.equal(await evaluate(`(async()=>{const session=JSON.parse(localStorage.getItem('forma.accounts.v1'));const account=session.accounts.find(a=>a.id===session.activeId);const {createDataRepository}=await import('/src/services/dataRepository.ts');return (await createDataRepository(account.databaseName).load()).customExercises.length})()`),0,'custom exercises are isolated per account')
  await evaluate(`document.querySelector('.planner-day[aria-label="Friday"]').click()`); await clickText('Make training day'); await evaluate(`document.querySelector('[data-catalog-exercise="pushup"] .exercise-card-copy > button').click()`)
  await clickText('Save plan'); await waitText('Your plan, favorites and gym equipment are saved.')
  await route('nutrition', 'Fuel your everyday.')
  assert.ok(await hasText('0 / 1,900 kcal'))
  assert.ok(!await hasText('Today rice')); assert.ok(!await hasText('Yesterday oats'))
  await clickText('+ Add food'); await fillFood('Second account food', 200, 10, 20, 5)
  await submit(); await waitText('Food saved.')
  await route('progress', 'Every little win.')
  assert.ok(await hasText('66 kg')); assert.ok(!await hasText('82 kg'))
  await route('profile', 'Make it personal.'); await clickText('Sign out')
  await waitText('Your space is waiting.')
  await clickText('Tjardo'); await waitText('Tjardo.')
  await route('workout', 'Your week. Your workout.')
  await evaluate(`document.querySelector('.planner-day[aria-label="Monday"]').click()`)
  assert.equal(await evaluate(`document.querySelector('[name="sessionName"]').value`), 'My upper body', 'switching accounts retains the original plan')
  assert.equal(await evaluate(`document.querySelector('[name="sets-incline-press"]').value`), '4')
  await route('nutrition', 'Fuel your everyday.')
  assert.ok(await hasText('300 / 2,500 kcal'))
  assert.ok(!await hasText('Second account food'))
  await route('progress', 'Every little win.'); assert.ok(await hasText('82 kg'))
  assert.ok(!await hasText('66 kg'))
  await route('profile', 'Make it personal.'); await clickText('Sign out')
  await waitText('Your space is waiting.'); await clickText('Second account')
  await waitText('Second account.'); await reload('Second account.')
  await route('nutrition', 'Fuel your everyday.')
  assert.ok(await hasText('200 / 1,900 kcal'))
  console.log('PASS: sign out persists, new accounts start empty, cancel works, accounts retain separate food and weight histories')

  const deletedDatabase = await evaluate(`JSON.parse(localStorage.getItem('forma.accounts.v1')).accounts.find(account => account.name === 'Second account').databaseName`)
  await route('profile', 'Make it personal.')
  await clickText('Delete account'); await waitText('This cannot be undone.')
  await clickText('Cancel')
  assert.ok(!await hasText('Permanently delete account'), 'cancel closes deletion confirmation')
  await reload('Make it personal.')
  assert.equal(await evaluate(`document.querySelector('[name="name"]').value`), 'Second account')
  await clickText('Delete account'); await clickText('Permanently delete account')
  await waitText('Your space is waiting.'); await reload('Your space is waiting.')
  assert.ok(!await hasText('Second account'), 'deleted account stays removed after reload')
  const counts = await evaluate(`new Promise((resolve, reject) => {
    const request = indexedDB.open(${JSON.stringify(deletedDatabase)});
    request.onerror = reject;
    request.onsuccess = () => {
      const db = request.result; const names = [...db.objectStoreNames];
      const transaction = db.transaction(names); const counts = [];
      names.forEach(name => { transaction.objectStore(name).count().onsuccess = event => counts.push(event.target.result); });
      transaction.oncomplete = () => { db.close(); resolve(counts); };
    };
  })`)
  assert.ok(counts.length > 0 && counts.every(count => count === 0), 'every account data store is cleared')
  await clickText('Tjardo'); await waitText('Tjardo.')
  await route('nutrition', 'Fuel your everyday.'); assert.ok(await hasText('300 / 2,500 kcal'))
  await route('progress', 'Every little win.'); assert.ok(await hasText('82 kg'))
  await evaluate(`localStorage.setItem('forma.profile.v1', JSON.stringify({ name: 'Do not restore' }))`)
  await route('profile', 'Make it personal.')
  await clickText('Delete account'); await clickText('Permanently delete account')
  await waitText('Your space is waiting.'); await reload('Your space is waiting.')
  assert.equal(await evaluate(`localStorage.getItem('forma.profile.v1')`), null)
  assert.deepEqual(await evaluate(`JSON.parse(localStorage.getItem('forma.accounts.v1')).accounts`), [])
  await clickText('Create new account'); await waitText('Step 1')
  assert.equal(await evaluate(`document.querySelector('[name="name"]').value`), '')
  console.log('PASS: account deletion requires confirmation, clears history, preserves other accounts and handles the last account without restoring legacy data')

  // Prepare phase-1 data in this test-only profile, then exercise the version upgrade.
  await evaluate(`(async () => {
    localStorage.removeItem('forma.accounts.v1');
    await new Promise((resolve, reject) => { const request = indexedDB.deleteDatabase('forma'); request.onsuccess = resolve; request.onerror = reject; });
    await new Promise((resolve, reject) => {
      const request = indexedDB.open('forma', 1);
      request.onupgradeneeded = () => ['workouts','nutrition','progress'].forEach(name => request.result.createObjectStore(name, {keyPath:'id'}));
      request.onerror = reject;
      request.onsuccess = () => {
        const db = request.result; const transaction = db.transaction('progress','readwrite');
        transaction.objectStore('progress').put({id:'preserved',note:'Existing record'});
        transaction.oncomplete = () => {db.close();resolve();};
      };
    });
    localStorage.setItem('forma.profile.v1', JSON.stringify({id:'legacy',name:'Returning user',goal:'recomposition',trainingDaysPerWeek:3}));
  })()`)
  await reload('Step 1')
  assert.equal(await evaluate(`document.querySelector('[name="name"]').value`), 'Returning user')
  assert.equal(await evaluate(`document.querySelector('[name="age"]').value`), '')
  const retained = await evaluate(`new Promise((resolve,reject) => {
    const request = indexedDB.open('forma'); request.onerror=()=>reject(request.error); request.onsuccess = () => {
      const db = request.result; const transaction = db.transaction('progress');
      const record = transaction.objectStore('progress').get('preserved');
      transaction.oncomplete = () => {db.close();resolve(record.result.note);};
    };
  })`)
  assert.equal(retained, 'Existing record')
  console.log('PASS: phase-1 profile migration and IndexedDB upgrade preserve existing records')
  // Reproduce the old Workout render failure and verify the recovery action
  // reloads the application without clearing saved browser data.
  const beforeRecovery = await evaluate('JSON.stringify(localStorage)')
  await evaluate(`(async () => {
    const react = await import('/node_modules/.vite/deps/react.js');
    const reactDom = await import('/node_modules/.vite/deps/react-dom_client.js');
    const {createElement} = react.default ?? react;
    const {createRoot} = reactDom.default ?? reactDom;
    const {AppErrorBoundary} = await import('/src/components/AppErrorBoundary.tsx');
    const container = document.createElement('div'); document.body.append(container);
    function OldWorkoutPage() { const workouts = undefined; return workouts.filter(() => true); }
    createRoot(container).render(createElement(AppErrorBoundary, null, createElement(OldWorkoutPage)));
  })()`)
  await waitText('Reload app')
  await clickText('Reload app'); await pause(200); await waitText('Step 1')
  assert.equal(await evaluate('JSON.stringify(localStorage)'), beforeRecovery)
  assert.equal(await evaluate(`document.querySelector('[name="name"]').value`), 'Returning user')
  assert.ok(!await hasText('Reload app'))
  console.log('PASS: a Workout render failure offers reload recovery without clearing saved data')
  console.log(`Screenshots: ${artifacts}`)
} finally {
  if (socket?.readyState === WebSocket.OPEN) {
    try { await call('Browser.close') } catch { /* The browser may already have exited. */ }
  }
  socket?.close()
  browser.kill()
}
