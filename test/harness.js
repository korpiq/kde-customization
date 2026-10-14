// Loads a KWin script's main.js in a mocked KWin environment, for testing window geometry with Node.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const MAIN_JS = process.env.MAIN_JS || path.join(__dirname, '..', 'resize-window-by-numpad', 'contents', 'code', 'main.js');

// screens: [{ geometry: {x, y, width, height}, area: {x, y, width, height} }], area defaults to geometry.
function load(screens) {
    const shortcuts = {};
    const window = {
        caption: 'test', normalWindow: true, resizeable: true,
        frameGeometry: { x: 0, y: 0, width: 100, height: 100 },
        setMaximize() {},
    };
    const workspace = {
        screens: screens.map(s => ({ geometry: s.geometry, area: s.area || s.geometry })),
        currentDesktop: 1,
        activeWindow: window,
        clientArea: (_type, screen) => ({ ...screen.area }),
        raiseWindow() {},
    };
    const context = {
        workspace,
        KWin: { MaximizeArea: 2 },
        console: { warn() {} },
        registerShortcut: (name, _text, keys, callback) => { shortcuts[name] = { keys, callback }; },
    };
    vm.runInNewContext(fs.readFileSync(MAIN_JS, 'utf8'), context);
    return {
        shortcuts,
        workspace,
        // Presses the shortcut and returns the resulting window geometry.
        press(name) {
            if (!shortcuts[name]) throw new Error('No shortcut: ' + name);
            window.frameGeometry = { x: 0, y: 0, width: 100, height: 100 };
            shortcuts[name].callback();
            return { ...window.frameGeometry };
        },
    };
}

module.exports = { load };
