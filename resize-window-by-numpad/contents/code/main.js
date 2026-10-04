const version = 'v0.9';

// Screen layout: 3 monitors side by side; windows snap to a 3x2 grid of cells.
const COLUMNS = 3;
const ROWS = 2;

const rowNames = ["Top", "Full Height", "Bottom"];
const columnNames = ["Left", "Center", "Right"];

// [numpad key as delivered with Meta held, column, row]
const keys = [
    ["Home", 0, 0], ["Up", 1, 0], ["PgUp", 2, 0],
    ["Left", 0, 1], ["Clear", 1, 1], ["Right", 2, 1],
    ["End", 0, 2], ["Down", 1, 2], ["PgDown", 2, 2],
];

// Rows 0 and 2 are the upper and lower half; row 1 is the full height.
function rowSpan(row) {
    return row === 1 ? [0, ROWS] : [row === 0 ? 0 : 1, 1];
}

// Small: the column of the key. Big: two columns, or all three from the center.
function columnSpan(column, big) {
    if (!big) return [column, 1];
    if (column === 1) return [0, COLUMNS];
    return [column === 0 ? 0 : 1, 2];
}

// The usable area (excluding panels) of each column's screen, left to right.
// Without exactly COLUMNS screens, the usable bounds are split evenly instead.
function columnAreas() {
    const desktop = workspace.currentDesktop;
    const areas = Array.from(workspace.screens)
        .sort((a, b) => a.geometry.x - b.geometry.x)
        .map(screen => workspace.clientArea(KWin.MaximizeArea, screen, desktop));
    if (areas.length === COLUMNS) {
        return areas;
    }
    const left = Math.min(...areas.map(a => a.x));
    const right = Math.max(...areas.map(a => a.x + a.width));
    const top = Math.max(...areas.map(a => a.y));
    const bottom = Math.min(...areas.map(a => a.y + a.height));
    const width = (right - left) / COLUMNS;
    return [...Array(COLUMNS).keys()].map(i => ({ x: left + i * width, y: top, width, height: bottom - top }));
}

// Spans whole columns horizontally; vertically only what every spanned screen leaves free.
function spanArea(col, colCount) {
    const spanned = columnAreas().slice(col, col + colCount);
    const left = Math.min(...spanned.map(a => a.x));
    const right = Math.max(...spanned.map(a => a.x + a.width));
    const top = Math.max(...spanned.map(a => a.y));
    const bottom = Math.min(...spanned.map(a => a.y + a.height));
    return { x: left, y: top, width: right - left, height: bottom - top };
}

function repositionWindow(column, row, big) {
    const window = workspace.activeWindow;
    console.warn('Reposition window: key', column, row, big, 'active:', window && window.caption,
        'normal:', window && window.normalWindow, 'resizeable:', window && window.resizeable);
    if (!window || !window.normalWindow || !window.resizeable) {
        return;
    }

    try {
        const [col, colCount] = columnSpan(column, big);
        const [rowStart, rowCount] = rowSpan(row);
        const area = spanArea(col, colCount);
        const cellHeight = area.height / ROWS;

        const newArea = {
            x: area.x,
            y: area.y + rowStart * cellHeight,
            width: area.width,
            height: rowCount * cellHeight
        };

        console.warn('Reposition window', version, window.caption, JSON.stringify(window.frameGeometry),
            'area:', JSON.stringify(area), 'target:', JSON.stringify(newArea));
        window.setMaximize(false, false);
        window.frameGeometry = newArea;
        workspace.raiseWindow(window);
    } catch (e) {
        console.warn('Reposition window failed:', e, e.stack);
    }
}

function register(name, shortcut, column, row, big) {
    registerShortcut(name, name, shortcut, () => repositionWindow(column, row, big));
}

let lastMinimized = null;

// Restores the window minimized last; otherwise minimizes the active window.
function toggleMinimized() {
    if (lastMinimized && lastMinimized.minimized) {
        lastMinimized.minimized = false;
        workspace.activeWindow = lastMinimized;
        lastMinimized = null;
        return;
    }
    const window = workspace.activeWindow;
    if (window && window.minimizable) {
        window.minimized = true;
        lastMinimized = window;
    }
}

function closeActiveWindow() {
    const window = workspace.activeWindow;
    if (window && window.closeable) {
        window.closeWindow();
    }
}

registerShortcut("Minimize or restore window", "Minimize or restore window", "Meta+Num+Ins", toggleMinimized);
registerShortcut("Close window", "Close window", "Meta+Num+Del", closeActiveWindow);

keys.forEach(([key, column, row]) => {
    const position = rowNames[row] + " " + columnNames[column];
    register("Reposition window " + position, "Meta+Num+" + key, column, row, false);
    register("Reposition window wide " + position, "Meta+Shift+Num+" + key, column, row, true);
});

console.warn('Reposition window', version, 'loaded');
