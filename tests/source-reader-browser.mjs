import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {join, resolve} from 'node:path';

// Focused, local-application checks. Historical QA directories are never the default output.
const base = (process.env.ATLAS_URL ?? 'http://127.0.0.1:4189/FedRAMP-Policy-Atlas').replace(/\/+$/, '') + '/';
const out = resolve(process.env.ATLAS_QA_DIR ?? '/tmp/atlas-source-reader-qa');
const fedrampCommit = 'a89d78477ddea98dc57eca24f5007794c2b4eeb6';
const fixture = JSON.parse(await readFile(new URL('../public/data/snapshots/fedramp/' + fedrampCommit + '/source.json', import.meta.url), 'utf8'));
const rule = fixture.FRR.SCG.data.all.CSO['SCG-CSO-RSC'];
const ksi = fixture.KSI.CNA.indicators['KSI-CNA-EIS'];
const rulePointer = '/FRR/SCG/data/all/CSO/SCG-CSO-RSC';
const ksiPointer = '/KSI/CNA/indicators/KSI-CNA-EIS';
const sourceUrl = 'https://raw.githubusercontent.com/FedRAMP/rules/' + fedrampCommit + '/fedramp-consolidated-rules.json';
const checks = [], skips = [], screenshots = [], errors = [];
const startedAt = new Date().toISOString();
let browser, page, failure, activeCheck;

await mkdir(out, {recursive: true});
const normalize = value => value.replace(/\s+/g, ' ').trim();
const displayedSource = value => normalize(value.replace(/\*\*/g, ''));
const reader = p => p.getByRole('region', {name: 'Published source content', exact: true});
const search = p => p.getByRole('textbox', {name: 'Search entities', exact: true});
const field = (p, name, scope = 'entry') => reader(p).locator('[data-source-field="' + name + '"][data-source-scope="' + scope + '"]');
const item = (p, pointer) => reader(p).locator('li[data-source-locator="' + pointer + '"]');

async function check(name, action) {
  activeCheck = name;
  const detail = await action();
  checks.push({name, status: 'passed', ...(detail === undefined ? {} : {detail})});
  console.log('PASS ' + name);
}

function observeErrors(p, context) {
  p.on('pageerror', error => errors.push({context, message: String(error)}));
}

async function ready(p) {
  await p.getByRole('textbox', {name: 'Search entities', exact: true}).waitFor();
}

async function choose(p, identifier) {
  await search(p).fill(identifier);
  await search(p).press('Enter');
  await p.waitForFunction(id => document.querySelector('.entity-id')?.textContent === id, identifier);
  await reader(p).waitFor();
}

async function appearance(p, site, map) {
  const disclosure = p.locator('.appearance');
  if (!await disclosure.evaluate(element => element.open)) await disclosure.locator(':scope > summary').click();
  if (site) await p.getByRole('combobox', {name: 'Site theme', exact: true}).selectOption(site);
  if (map) await p.getByRole('combobox', {name: 'Map theme', exact: true}).selectOption(map);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(150);
}

async function certificationClass(p, value) {
  await p.getByRole('button', {name: 'Filters', exact: true}).click();
  await p.getByRole('combobox', {name: 'Certification class', exact: true}).selectOption(value);
  await p.getByRole('button', {name: 'Done', exact: true}).click();
}

async function researchState(p) {
  return {
    query: await search(p).inputValue(),
    selected: await p.locator('.entity-id').innerText(),
    classFilter: await p.getByRole('combobox', {name: 'Certification class', exact: true, includeHidden: true}).inputValue(),
    url: p.url(),
  };
}

async function cameraObservation(p) {
  if (!await p.locator('.overview-footprint').count()) return null;
  return {
    footprint: await p.locator('.overview-footprint').getAttribute('points'),
    target: await p.locator('.overview-target').getAttribute('transform'),
    zoom: await p.locator('.overview-status > span').innerText(),
  };
}

async function shot(name) {
  await page.locator('.inspector-scroll').evaluate(element => { element.scrollTop = 0; });
  await page.locator('.entity-id').scrollIntoViewIfNeeded();
  const path = join(out, name + '.png');
  await page.screenshot({path, fullPage: true});
  screenshots.push({name, path});
}

async function assertRuleText(p) {
  assert.equal(normalize(await reader(p).locator('.statement').innerText()), normalize(rule.statement));
  assert.equal(await field(p, 'force').locator(':scope > strong').innerText(), rule.force);
  assert.ok((await reader(p).locator('.source-record-revision').innerText()).includes(fixture.info.version));
  const addresses = field(p, 'affects');
  assert.equal(await addresses.getAttribute('data-source-locator'), rulePointer + '/affects');
  assert.deepEqual(await addresses.locator('.source-record-text').allInnerTexts(), rule.affects);
  assert.equal(await field(p, 'following_information').locator(':scope > .source-record-list > li').count(), rule.following_information.length);
  for (const [index, value] of rule.following_information.entries()) {
    assert.equal(normalize(await item(p, rulePointer + '/following_information/' + index).locator(':scope > .source-record-text').innerText()), normalize(value));
  }
  for (const [index, value] of rule.artifacts.all.entries()) {
    assert.equal(normalize(await item(p, rulePointer + '/artifacts/all/' + index).locator(':scope > .source-record-text').innerText()), normalize(value));
  }
  for (const [index, value] of rule.notes.entries()) {
    assert.equal(normalize(await item(p, rulePointer + '/notes/' + index).locator(':scope > .source-record-text').innerText()), normalize(value));
  }
}

async function sourceDisclosure(p, pointer) {
  const citation = item(p, pointer).locator(':scope > details.source-record-citation');
  const summary = citation.locator(':scope > summary');
  await summary.focus();
  await summary.press('Enter');
  assert.equal(await citation.evaluate(element => element.open), true);
  assert.equal(await citation.locator('.source-record-locator').innerText(), pointer);
  assert.ok((await citation.innerText()).includes(fixture.info.version));
  assert.ok((await citation.innerText()).includes(fedrampCommit));
  assert.equal(await citation.getByRole('link', {name: 'Open pinned source', exact: true}).getAttribute('href'), sourceUrl);
  return {citation, summary};
}

async function assertNoProseOverflow(p) {
  const overflow = await p.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const candidates = document.querySelectorAll('.source-record .source-record-text, .source-record .source-record-list, .source-record .source-record-original, .source-record .source-record-locator');
    return [...candidates].filter(element => element.getClientRects().length).flatMap(element => {
      const rect = element.getBoundingClientRect();
      const outsideViewport = rect.left < -1 || rect.right > width + 1;
      const overflowsBox = element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 2;
      return outsideViewport || overflowsBox ? [{
        element: element.className,
        text: element.textContent.slice(0, 100),
        left: rect.left, right: rect.right, viewport: width,
        clientWidth: element.clientWidth, scrollWidth: element.scrollWidth,
      }] : [];
    });
  });
  assert.deepEqual(overflow, []);
  assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), false);
}

try {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });

  await check('Appearance is resolved before the application module runs', async () => {
    const cases = [
      {name: 'persisted dark overrides a light device', preference: 'dark', device: 'light', expected: 'dark'},
      {name: 'device preference follows a dark device', preference: 'system', device: 'dark', expected: 'dark'},
      {name: 'persisted light overrides a dark device', preference: 'light', device: 'dark', expected: 'light'},
    ];
    for (const value of cases) {
      const initial = await browser.newPage({colorScheme: value.device});
      await initial.addInitScript(preference => window.localStorage.setItem('atlas-site-theme', preference), value.preference);
      // This also covers production entry bundles. Inline appearance bootstrap still runs.
      await initial.route('**/*', route => route.request().resourceType() === 'script' ? route.abort('blockedbyclient') : route.continue());
      await initial.goto(base, {waitUntil: 'domcontentloaded'});
      assert.equal(await initial.locator('html').getAttribute('data-theme'), value.expected, value.name);
      assert.equal(await initial.locator('html').evaluate(element => element.style.colorScheme), value.expected, value.name);
      assert.equal(await initial.locator('#root').evaluate(element => element.childElementCount), 0);
      await initial.close();
    }
    return cases.map(value => value.name);
  });

  page = await browser.newPage({viewport: {width: 1440, height: 1000}, colorScheme: 'light', timezoneId: 'America/New_York'});
  page.setDefaultTimeout(20000);
  observeErrors(page, 'main');
  await page.goto(base);
  await ready(page);
  await certificationClass(page, 'B');
  await choose(page, 'SCG-CSO-RSC');
  await appearance(page, 'light', 'dark');

  await check('SCG reader exposes the exact parent statement, three qualified subitems, artifacts, and notes', async () => {
    await assertRuleText(page);
    const values = rule.following_information;
    assert.equal(values.filter(value => value.startsWith('Required:')).length, 2);
    assert.equal(values.filter(value => value.startsWith('Recommended:')).length, 1);
    assert.ok(values[0].includes('that control enterprise access to the entire cloud service offering'));
    await shot('01-light-reader');
  });

  await check('Each SCG subitem exposes its exact locator, original text, pinned revision, and source URL', async () => {
    for (const [index, value] of rule.following_information.entries()) {
      const pointer = rulePointer + '/following_information/' + index;
      const {citation, summary} = await sourceDisclosure(page, pointer);
      assert.equal(await citation.locator('.source-record-original').innerText(), value);
      if (index === 0) {
        await summary.scrollIntoViewIfNeeded();
        const path = join(out, '04-source-disclosure.png');
        await page.screenshot({path, fullPage: true});
        screenshots.push({name: '04-source-disclosure', path});
      }
      await summary.press('Space');
      assert.equal(await citation.evaluate(element => element.open), false);
      assert.equal(await summary.evaluate(element => element === document.activeElement), true);
    }
    const addresses = field(page, 'affects').locator(':scope > details.source-record-citation');
    await addresses.locator(':scope > summary').press('Enter');
    assert.equal(await addresses.locator('.source-record-locator').innerText(), rulePointer + '/affects');
    assert.deepEqual(JSON.parse(await addresses.locator('.source-record-original').innerText()), rule.affects);
    await addresses.locator(':scope > summary').press('Space');
  });

  await check('Dark appearance preserves exact reader wording, query, class, selection, and available camera observations', async () => {
    await page.waitForTimeout(600);
    const before = await researchState(page);
    const cameraBefore = await cameraObservation(page);
    const textBefore = await reader(page).innerText();
    await appearance(page, 'dark', 'dark');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await reader(page).innerText(), textBefore);
    assert.deepEqual(await researchState(page), before);
    if (cameraBefore) assert.deepEqual(await cameraObservation(page), cameraBefore);
    else skips.push({check: 'Camera observations during appearance change', reason: 'WebGL overview was not present; source and research state checks still ran.'});
    await assertRuleText(page);
    await shot('02-dark-reader');
    return {cameraObserved: Boolean(cameraBefore)};
  });

  await check('Map appearance remains independent and Follow site responds without changing research state', async () => {
    const before = await researchState(page);
    await appearance(page, 'dark', 'light');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await page.locator('.graph-stage').getAttribute('data-map-theme'), 'light');
    await appearance(page, 'light', 'site');
    assert.equal(await page.locator('.graph-stage').getAttribute('data-map-theme'), 'light');
    await appearance(page, 'dark', 'site');
    assert.equal(await page.locator('.graph-stage').getAttribute('data-map-theme'), 'dark');
    assert.deepEqual(await researchState(page), before);
  });

  await check('Light, Dark, and device preferences persist across reloads with the selected record and class', async () => {
    await page.emulateMedia({colorScheme: 'dark'});
    for (const preference of ['light', 'dark', 'system']) {
      await appearance(page, preference, 'site');
      await page.reload();
      await reader(page).waitFor();
      assert.equal(await page.locator('html').getAttribute('data-theme'), preference === 'light' ? 'light' : 'dark');
      assert.deepEqual(await page.evaluate(() => [window.localStorage.getItem('atlas-site-theme'), window.localStorage.getItem('atlas-map-theme')]), [preference, 'site']);
      assert.equal(await page.locator('.entity-id').innerText(), 'SCG-CSO-RSC');
      assert.equal(await page.getByRole('combobox', {name: 'Certification class', exact: true, includeHidden: true}).inputValue(), 'B');
      await assertRuleText(page);
    }
  });

  await check('Device appearance changes apply live and explicit site preferences override the device', async () => {
    await choose(page, 'SCG-CSO-RSC');
    const before = await researchState(page);
    await page.emulateMedia({colorScheme: 'light'});
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    assert.equal(await page.locator('.graph-stage').getAttribute('data-map-theme'), 'light');
    await page.emulateMedia({colorScheme: 'dark'});
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    assert.equal(await page.locator('.graph-stage').getAttribute('data-map-theme'), 'dark');
    await appearance(page, 'light');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await appearance(page, 'dark');
    await page.emulateMedia({colorScheme: 'light'});
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.deepEqual(await researchState(page), before);
  });

  await check('The same verbatim reader survives real flow and table presentations with query, class, and selection', async () => {
    const before = await researchState(page);
    for (const mode of ['Flow chart', 'Table']) {
      const button = page.getByRole('button', {name: mode, exact: true});
      await button.click();
      assert.equal(await button.getAttribute('aria-pressed'), 'true');
      if (mode === 'Flow chart') await page.locator('.react-flow').waitFor();
      else await page.locator('table').waitFor();
      await assertRuleText(page);
      const current = await researchState(page);
      for (const key of ['query', 'selected', 'classFilter']) assert.equal(current[key], before[key]);
    }
  });

  await check('KSI B remains Optional, C retains its wording, and D remains missing without an inferred KSI force', async () => {
    await choose(page, 'KSI-CNA-EIS');
    const tabs = page.locator('.class-tabs');
    for (const variant of ['b', 'c']) {
      await tabs.getByRole('button', {name: variant.toUpperCase(), exact: true}).click();
      assert.equal(normalize(await reader(page).locator('.statement').innerText()), displayedSource(ksi.varies_by_class[variant].statement));
      const citation = field(page, 'statement', 'class').locator(':scope > details.source-record-citation');
      await citation.locator(':scope > summary').click();
      assert.equal(await citation.locator('.source-record-locator').innerText(), ksiPointer + '/varies_by_class/' + variant + '/statement');
      assert.equal(await citation.locator('.source-record-original').innerText(), ksi.varies_by_class[variant].statement);
      await citation.locator(':scope > summary').click();
      assert.equal(await reader(page).locator('.source-record-force').count(), 0);
    }
    await tabs.getByRole('button', {name: 'D', exact: true}).click();
    assert.equal(await reader(page).locator('.statement').innerText(), 'Not specified in source for this class.');
    assert.equal(await field(page, 'statement', 'class').count(), 0);
    assert.equal(await reader(page).locator('.source-record-force').count(), 0);
    await tabs.getByRole('button', {name: 'B', exact: true}).click();
    assert.match(await reader(page).locator('.statement').innerText(), /^Optional:/);
    await shot('05-ksi-optional-class-b');
  });

  await choose(page, 'SCG-CSO-RSC');
  await appearance(page, 'dark', 'site');
  for (const width of [320, 390]) {
    await check(width + 'px dark reading and expanded source details have no document or prose overflow', async () => {
      await page.setViewportSize({width, height: 844});
      await reader(page).scrollIntoViewIfNeeded();
      await assertRuleText(page);
      await assertNoProseOverflow(page);
      const {citation, summary} = await sourceDisclosure(page, rulePointer + '/following_information/0');
      assert.equal(await citation.locator('.source-record-original').innerText(), rule.following_information[0]);
      await assertNoProseOverflow(page);
      await summary.press('Space');
      if (width === 390) await shot('03-mobile-dark-reader');
    });
  }

  await check('Forced colors and reduced motion retain a keyboard-operable table and source-reading route', async () => {
    await page.emulateMedia({forcedColors: 'active', reducedMotion: 'reduce'});
    await page.goto(base);
    await ready(page);
    assert.deepEqual(await page.evaluate(() => ({
      forcedColors: window.matchMedia('(forced-colors: active)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    })), {forcedColors: true, reducedMotion: true});
    if (await page.getByRole('checkbox', {name: 'Reduced motion', exact: true}).count()) {
      assert.equal(await page.getByRole('checkbox', {name: 'Reduced motion', exact: true}).isChecked(), true);
    }
    const filters = page.getByRole('button', {name: 'Filters', exact: true});
    await filters.focus();
    await filters.press('Enter');
    const accessibleTable = page.getByRole('button', {name: 'Accessible table', exact: true});
    await accessibleTable.focus();
    await accessibleTable.press('Enter');
    await page.locator('table').waitFor();
    await search(page).fill('SCG-CSO-RSC');
    const inspect = page.getByRole('button', {name: 'Inspect SCG-CSO-RSC', exact: true});
    await inspect.focus();
    await inspect.press('Enter');
    await reader(page).waitFor();
    await assertRuleText(page);
    const {summary} = await sourceDisclosure(page, rulePointer + '/following_information/0');
    const focus = await summary.evaluate(element => ({
      active: element === document.activeElement,
      style: window.getComputedStyle(element).outlineStyle,
      width: parseFloat(window.getComputedStyle(element).outlineWidth),
    }));
    assert.equal(focus.active, true);
    assert.notEqual(focus.style, 'none');
    assert.ok(focus.width > 0);
    await assertNoProseOverflow(page);
    await summary.press('Space');
    await choose(page, 'KSI-CNA-EIS');
    const selectedClass = page.locator('.class-tabs').getByRole('button', {name: 'B', exact: true});
    await selectedClass.focus();
    await selectedClass.press('Enter');
    assert.equal(await selectedClass.getAttribute('aria-pressed'), 'true');
    const classFocus = await selectedClass.evaluate(element => ({
      active: element === document.activeElement,
      visible: element.matches(':focus-visible'),
      offset: parseFloat(window.getComputedStyle(element).outlineOffset),
      width: parseFloat(window.getComputedStyle(element).outlineWidth),
    }));
    assert.equal(classFocus.active, true);
    assert.equal(classFocus.visible, true);
    assert.ok(classFocus.offset > 0 && classFocus.width >= 2, 'Selected class retains a separate outer keyboard-focus outline.');
  });

  await check('Denied browser storage retains working in-memory dark appearance and verbatim reading', async () => {
    const denied = await browser.newPage({viewport: {width: 1280, height: 900}, colorScheme: 'light'});
    observeErrors(denied, 'storage-denied');
    await denied.addInitScript(() => {
      window.Storage.prototype.getItem = () => { throw new Error('Storage unavailable for focused QA'); };
      window.Storage.prototype.setItem = () => { throw new Error('Storage unavailable for focused QA'); };
    });
    await denied.goto(base);
    await ready(denied);
    await choose(denied, 'SCG-CSO-RSC');
    await appearance(denied, 'dark', 'site');
    assert.equal(await denied.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await denied.locator('.graph-stage').getAttribute('data-map-theme'), 'dark');
    await assertRuleText(denied);
    await denied.close();
  });

  await check('No uncaught browser errors occurred in the reader and appearance journeys', async () => {
    assert.deepEqual(errors, []);
  });
} catch (error) {
  const environmentBlocked = !browser && /socket\(\) failed: Operation not permitted|browserType\.launch.*(?:EACCES|EPERM)|Executable doesn't exist/s.test(String(error));
  failure = {check: activeCheck ?? 'Browser setup', message: String(error), stack: error?.stack, environmentBlocked};
  checks.push({name: failure.check, status: environmentBlocked ? 'blocked' : 'failed', message: failure.message});
  console.error((environmentBlocked ? 'BLOCKED ' : 'FAIL ') + failure.check + ': ' + failure.message);
  if (page) {
    try {
      const path = join(out, 'failure.png');
      await page.screenshot({path, fullPage: true});
      screenshots.push({name: 'failure', path});
    } catch { /* Preserve the primary failure if a screenshot is unavailable. */ }
  }
} finally {
  await writeFile(join(out, 'results.json'), JSON.stringify({
    status: failure ? (failure.environmentBlocked ? 'environment-blocked' : 'failed') : 'passed',
    execution: {browserLaunched: Boolean(browser), applicationPageCreated: Boolean(page)},
    startedAt, completedAt: new Date().toISOString(),
    baseUrl: base, browser: browser?.version(),
    source: {version: fixture.info.version, commit: fedrampCommit, rulePointer, ksiPointer},
    checks, skips, errors, screenshots, ...(failure ? {failure} : {}),
    scope: 'Focused local Chromium reader/theme/navigation checks. Not representative-user validation or a comprehensive accessibility audit.',
  }, null, 2) + '\n');
  await browser?.close();
}
if (failure) process.exitCode = 1;
