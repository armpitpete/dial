const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { detailsOnly, LONG_NAME_THRESHOLD } = require("../presentation.js");

test("presentation removes only a repeated station-name prefix", () => {
  const name = "A very long station name";
  assert.equal(detailsOnly(name, `${name}. Germany. English. synthwave.`), "Germany. English. synthwave.");
  assert.equal(detailsOnly(name, "Independent description."), "Independent description.");
});

test("presentation handles name-only summaries safely", () => {
  const name = "Name only";
  assert.equal(detailsOnly(name, `${name}.`), "");
  assert.equal(detailsOnly("", "Metadata"), "Metadata");
});

test("long-name threshold is intentionally bounded", () => {
  assert.equal(LONG_NAME_THRESHOLD, 80);
});

test("presentation loads after app state and has bounded-name CSS", () => {
  const html = fs.readFileSync(require.resolve("../index.html"), "utf8");
  const styles = fs.readFileSync(require.resolve("../styles.css"), "utf8");
  assert.ok(html.indexOf('src="presentation.js"') > html.indexOf('src="app.js"'));
  assert.match(styles, /\.station-name\.long-station-name/);
  assert.match(styles, /-webkit-line-clamp:\s*4/);
  assert.match(styles, /\.result-name\.long-station-name/);
  assert.match(styles, /-webkit-line-clamp:\s*2/);
});
