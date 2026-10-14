// Run with: node --test test/*.test.js
const test = require('node:test');
const assert = require('node:assert');
const { load } = require('./harness');

const rect = (x, y, width, height) => ({ x, y, width, height });

// Home: 3 portrait monitors side by side, a 44 px panel on top of the center one.
const home = [0, 1200, 2400].map(x => ({
    geometry: rect(x, 0, 1200, 1920),
    area: x === 1200 ? rect(x, 44, 1200, 1876) : rect(x, 0, 1200, 1920),
}));
// Laptop: the internal screen with a 44 px panel at the bottom.
const laptop = { geometry: rect(0, 0, 2560, 1600), area: rect(0, 0, 2560, 1556) };
// Docked: an external screen above the laptop screen, slightly wider and offset left.
const external = { geometry: rect(-320, -1600, 3200, 1600) };

test('three columns: a cell per screen and row', () => {
    const { press } = load(home);
    assert.deepStrictEqual(press('Reposition window Top Left'), rect(0, 0, 1200, 960));
    assert.deepStrictEqual(press('Reposition window Bottom Center'), rect(1200, 982, 1200, 938));
    assert.deepStrictEqual(press('Reposition window Full Height Right (NumLock on)'), rect(2400, 0, 1200, 1920));
});

test('three columns: wide spans two screens, or all three from the center', () => {
    const { press } = load(home);
    assert.deepStrictEqual(press('Reposition window wide Full Height Left'), rect(0, 0, 2400, 1920));
    assert.deepStrictEqual(press('Reposition window wide Top Right'), rect(1200, 0, 2400, 960));
    assert.deepStrictEqual(press('Reposition window wide Full Height Center'), rect(0, 0, 3600, 1920));
});

test('single screen: thirds without Shift', () => {
    const { press } = load([laptop]);
    assert.deepStrictEqual(press('Reposition window Full Height Left'), rect(0, 0, 2560 / 3, 1556));
    assert.deepStrictEqual(press('Reposition window Top Center'), rect(2560 / 3, 0, 2560 / 3, 778));
    assert.deepStrictEqual(press('Reposition window Bottom Right (NumLock on)'), rect(2 * 2560 / 3, 778, 2560 / 3, 778));
});

test('single screen: halves or the whole width with Shift', () => {
    const { press } = load([laptop]);
    assert.deepStrictEqual(press('Reposition window wide Full Height Left'), rect(0, 0, 1280, 1556));
    assert.deepStrictEqual(press('Reposition window wide Top Right'), rect(1280, 0, 1280, 778));
    assert.deepStrictEqual(press('Reposition window wide Bottom Center'), rect(0, 778, 2560, 778));
    assert.deepStrictEqual(press('Reposition window wide Full Height Center'), rect(0, 0, 2560, 1556));
});

test('external screen above: top row is the upper screen, bottom row the lower', () => {
    const { press } = load([laptop, external]);
    assert.deepStrictEqual(press('Reposition window Top Left'), rect(-320, -1600, 3200 / 3, 1600));
    assert.deepStrictEqual(press('Reposition window wide Top Right'), rect(1280, -1600, 1600, 1600));
    assert.deepStrictEqual(press('Reposition window Bottom Center'), rect(2560 / 3, 0, 2560 / 3, 1556));
    assert.deepStrictEqual(press('Reposition window wide Bottom Center'), rect(0, 0, 2560, 1556));
});

test('external screen above: full height spans both where they overlap', () => {
    const { press } = load([laptop, external]);
    assert.deepStrictEqual(press('Reposition window Full Height Right'), rect(2 * 2560 / 3, -1600, 2560 / 3, 3156));
    assert.deepStrictEqual(press('Reposition window wide Full Height Left'), rect(0, -1600, 1280, 3156));
    assert.deepStrictEqual(press('Reposition window wide Full Height Center'), rect(0, -1600, 2560, 3156));
});

test('two screens side by side: the bounds split evenly into 3 columns, of the height usable on all', () => {
    const { press } = load([
        { geometry: rect(0, 0, 1920, 1080), area: rect(0, 30, 1920, 1050) },
        { geometry: rect(1920, 0, 2560, 1440) },
    ]);
    const width = 4480 / 3;
    assert.deepStrictEqual(press('Reposition window Full Height Center'), rect(width, 30, width, 1050));
    assert.deepStrictEqual(press('Reposition window wide Full Height Center'), rect(0, 30, 4480, 1050));
});

test('the layout follows the screens at each keypress', () => {
    const { press, workspace } = load([laptop]);
    assert.deepStrictEqual(press('Reposition window Top Left'), rect(0, 0, 2560 / 3, 778));
    workspace.screens.push({ geometry: external.geometry, area: external.geometry });
    assert.deepStrictEqual(press('Reposition window Top Left'), rect(-320, -1600, 3200 / 3, 1600));
});
