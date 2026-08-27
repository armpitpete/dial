const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const Volume = require(path.join(__dirname, '..', 'volume.js'));

test('volume values are normalized into the browser audio range', () => {
  assert.equal(Volume.normalizeVolume(-10), 0);
  assert.equal(Volume.normalizeVolume(0), 0);
  assert.equal(Volume.normalizeVolume(55.4), 55);
  assert.equal(Volume.normalizeVolume(100), 100);
  assert.equal(Volume.normalizeVolume(150), 100);
  assert.equal(Volume.normalizeVolume('bad'), Volume.DEFAULT_VOLUME);
});

test('volume is stored separately from presets and library state', () => {
  assert.equal(Volume.VOLUME_STORAGE_KEY, 'dial.volume.v1');
});

test('page exposes a native accessible volume slider', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /<label id="volume-label" for="volume-slider">Volume<\/label>/);
  assert.match(html, /id="volume-slider"[^>]*type="range"[^>]*min="0"[^>]*max="100"[^>]*step="5"/);
  assert.match(html, /id="volume-value"/);
  assert.match(html, /href="volume\.css"/);
  assert.ok(html.indexOf('src="volume.js"') > html.indexOf('src="app.js"'));
});

test('volume slider keeps a large touch target', () => {
  const styles = fs.readFileSync(path.join(__dirname, '..', 'volume.css'), 'utf8');
  assert.match(styles, /#volume-slider/);
  assert.match(styles, /min-height:\s*48px/);
});
