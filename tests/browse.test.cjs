const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const Browse = require(path.join(__dirname, '..', 'browse.js'));

test('browse exposes the six intended continents', () => {
  assert.deepEqual(Object.keys(Browse.CONTINENTS), [
    'Europe', 'Africa', 'Asia', 'North America', 'South America', 'Oceania'
  ]);
});

test('locale inference uses an explicit region and does not guess one', () => {
  assert.equal(Browse.inferRegion('en-GB'), 'GB');
  assert.equal(Browse.inferRegion('en'), '');
});

test('quick country and language choices are intentionally bounded', () => {
  assert.equal(Browse.COUNTRY_CHOICES[0], 'United Kingdom');
  assert.ok(Browse.COUNTRY_CHOICES.includes('Japan'));
  assert.ok(Browse.LANGUAGE_CHOICES.includes('English'));
  assert.ok(Browse.LANGUAGE_CHOICES.includes('Japanese'));
});

test('country names are usable Radio Browser country queries', () => {
  assert.equal(Browse.countryName('GB', 'en'), 'United Kingdom');
  assert.equal(Browse.countryName('DE', 'en'), 'Germany');
});

test('continent start choice is deterministic with supplied random source', () => {
  assert.equal(Browse.chooseContinentCountry('Europe', () => 0), 'GB');
  assert.equal(Browse.chooseContinentCountry('Oceania', () => 0.999), 'PF');
  assert.equal(Browse.chooseContinentCountry('Unknown', () => 0), '');
});

test('recent choices deduplicate and remain bounded', () => {
  let recents = [];
  for (let index = 0; index < 10; index += 1) {
    recents = Browse.addRecentChoice(recents, { kind: 'country', query: `Country ${index}` });
  }
  assert.equal(recents.length, Browse.RECENT_LIMIT);
  recents = Browse.addRecentChoice(recents, { kind: 'country', query: 'Country 9' });
  assert.equal(recents.length, Browse.RECENT_LIMIT);
  assert.deepEqual(recents[0], { kind: 'country', query: 'Country 9' });
});

test('invalid recent choices are discarded', () => {
  assert.deepEqual(Browse.normalizeRecent([
    { kind: 'continent', query: 'Europe' },
    { kind: 'name', query: 'A' },
    { kind: 'tag', query: 'Jazz' }
  ]), [{ kind: 'tag', query: 'Jazz' }]);
});

test('page contains optional start choices and progressive browse routes', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /id="start-panel"/);
  assert.match(html, /id="start-country"/);
  assert.match(html, /id="start-music"/);
  assert.match(html, /id="start-news"/);
  assert.match(html, /id="start-world"/);
  assert.match(html, /id="start-surprise"/);
  assert.match(html, /id="start-skip"/);
  assert.match(html, /id="browse-country"/);
  assert.match(html, /id="country-panel"[^>]*hidden/);
  assert.match(html, /id="browse-language"/);
  assert.match(html, /id="language-panel"[^>]*hidden/);
  assert.match(html, /data-search-kind="name"/);
  assert.match(html, /id="browse-genre"/);
  assert.match(html, /id="genre-choices"[^>]*hidden/);
  assert.match(html, /id="talk-choices"[^>]*hidden/);
  assert.match(html, /id="browse-continent"/);
  assert.match(html, /id="continent-choices"[^>]*hidden/);
  assert.match(html, /Suggested countries in selected continent/);
  assert.match(html, /id="recent-choices"/);
  assert.ok(html.indexOf('src="browse.js"') > html.indexOf('src="app.js"'));
});

test('browse logic keeps one secondary choice panel open at a time and collapses after search', () => {
  const script = fs.readFileSync(path.join(__dirname, '..', 'browse.js'), 'utf8');
  assert.match(script, /const choicePanels = \[/);
  assert.match(script, /function hideChoicePanels\(except = null\)/);
  assert.match(script, /function revealChoicePanel\(panel\)[\s\S]*hideChoicePanels\(panel\)/);
  assert.match(script, /function submitSearch\(kind, query\)[\s\S]*hideChoicePanels\(\)/);
  assert.match(script, /browse-continent[^\n]*revealChoicePanel\(continentChoices\)/);
});

test('selected browse choices stay visible and cumulative with accessible state', () => {
  const script = fs.readFileSync(path.join(__dirname, '..', 'browse.js'), 'utf8');
  const styles = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
  assert.match(script, /const activeFilters = \{\}/);
  assert.match(script, /function setActiveChoice\(kind, query\)/);
  assert.match(script, /activeFilters\[kind\] = term/);
  assert.match(script, /root\.DialBrowseActiveFilters = \{ \.\.\.activeFilters \}/);
  assert.doesNotMatch(script.match(/function setActiveChoice\(kind, query\) \{[\s\S]*?\n    \}/)?.[0] || '', /clearActiveChoice\(/);
  assert.match(script, /button\.textContent = `\$\{label\}: \$\{term\}`/);
  assert.match(script, /setAttribute\("aria-pressed", "true"\)/);
  assert.match(script, /setAttribute\("aria-label", `Selected \$\{label\}: \$\{term\}`\)/);
  assert.match(script, /classList\.add\("selected-choice"\)/);
  assert.match(script, /clear-search-button[^\n]*clearActiveChoice/);
  assert.match(styles, /button\.selected-choice/);
  assert.match(styles, /--selected:\s*#ffd400/);
});

test('browse controls retain hidden semantics and collapse to one column on narrow screens', () => {
  const styles = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
  assert.match(styles, /\[hidden\]\s*\{\s*display:\s*none\s*!important;\s*\}/);
  assert.match(styles, /\.choice-grid,/);
  assert.match(styles, /\.browse-actions/);
  assert.match(styles, /grid-template-columns:\s*repeat\(2/);
  assert.match(styles, /@media \(max-width: 620px\)/);
  assert.match(styles, /\.choice-grid, \.browse-actions \{ grid-template-columns: 1fr; \}/);
});
