const version = 'v0.12';

const rowNames = ["Top", "Full Height", "Bottom"];
const columnNames = ["Left", "Center", "Right"];

// [numpad key with NumLock off, with NumLock on, column, row]
// Shift flips NumLock, so Shift shortcuts only need the NumLock-off key.
const keys = [
    ["Home", "7", 0, 0], ["Up", "8", 1, 0], ["PgUp", "9", 2, 0],
    ["Left", "4", 0, 1], ["Clear", "5", 1, 1], ["Right", "6", 2, 1],
    ["End", "1", 0, 2], ["Down", "2", 1, 2], ["PgDown", "3", 2, 2],
];

function bounds(areas) {
    const left = Math.min(...areas.map(a => a.x));
    const right = Math.max(...areas.map(a => a.x + a.width));
    const top = Math.min(...areas.map(a => a.y));
    const bottom = Math.max(...areas.map(a => a.y + a.height));
    return { x: left, y: top, width: right - left, height: bottom - top };
}

// Row 0 is the upper half of the area, row 1 the full height and row 2 the lower half.
function rowOf(area, row) {
    if (row === 1) return { x: area.x, y: area.y, width: area.width, height: area.height };
    const height = area.height / 2;
    return { x: area.x, y: area.y + (row === 0 ? 0 : height), width: area.width, height };
}

// One screen split into columns: thirds, or wide: left half, whole width (center) or right half.
function columnOf(area, column, wide) {
    let left, width;
    if (!wide) {
        width = area.width / 3;
        left = area.x + column * width;
    } else if (column === 1) {
        [left, width] = [area.x, area.width];
    } else {
        width = area.width / 2;
        left = area.x + (column === 0 ? 0 : width);
    }
    return { x: left, y: area.y, width, height: area.height };
}

// Spans columns of a grid of 3 column areas: one, or wide: two, or all three from the center.
// Vertically takes the tallest usable extent among the spanned columns, so a panel on one
// of several spanned screens is ignored.
function gridColumns(columns, column, wide) {
    if (!wide) return bounds([columns[column]]);
    if (column === 1) return bounds(columns);
    return bounds(columns.slice(column === 0 ? 0 : 1, column === 0 ? 2 : 3));
}

// Each layout is chosen when it matches the screens, and maps a key to a window rectangle.
// screens: [{ geometry, area }] sorted left to right, area being the usable part (without panels).
const layouts = [
    {
        // 3 monitors side by side, one column each.
        name: "threeColumns",
        matches: screens => screens.length === 3,
        target: (screens, column, row, wide) =>
            rowOf(gridColumns(screens.map(s => s.area), column, wide), row),
    },
    {
        // A single screen, e.g. a laptop on its own.
        name: "single",
        matches: screens => screens.length === 1,
        target: (screens, column, row, wide) => rowOf(columnOf(screens[0].area, column, wide), row),
    },
    {
        // An external screen above the internal one: the top row is the upper screen,
        // the bottom row the lower screen, and full height spans both where they overlap.
        name: "stackedAbove",
        matches: screens => {
            if (screens.length !== 2) return false;
            const [upper, lower] = stacked(screens).map(s => s.geometry);
            return upper.y + upper.height <= lower.y
                && upper.x < lower.x + lower.width && lower.x < upper.x + upper.width;
        },
        target: (screens, column, row, wide) => {
            const [upper, lower] = stacked(screens).map(s => s.area);
            if (row !== 1) return columnOf(row === 0 ? upper : lower, column, wide);
            const left = Math.max(upper.x, lower.x);
            const right = Math.min(upper.x + upper.width, lower.x + lower.width);
            const top = upper.y;
            const bottom = lower.y + lower.height;
            return columnOf({ x: left, y: top, width: right - left, height: bottom - top }, column, wide);
        },
    },
    {
        // Anything else: the usable bounds split evenly into 3 columns and 2 rows.
        name: "evenColumns",
        matches: () => true,
        target: (screens, column, row, wide) => {
            const areas = screens.map(s => s.area);
            const left = Math.min(...areas.map(a => a.x));
            const right = Math.max(...areas.map(a => a.x + a.width));
            const top = Math.max(...areas.map(a => a.y));
            const bottom = Math.min(...areas.map(a => a.y + a.height));
            const width = (right - left) / 3;
            const columns = [0, 1, 2].map(i => ({ x: left + i * width, y: top, width, height: bottom - top }));
            return rowOf(gridColumns(columns, column, wide), row);
        },
    },
];

function stacked(screens) {
    return [...screens].sort((a, b) => a.geometry.y - b.geometry.y);
}

// The screens left to right, with the usable area of each on the current desktop.
function currentScreens() {
    const desktop = workspace.currentDesktop;
    return Array.from(workspace.screens)
        .sort((a, b) => a.geometry.x - b.geometry.x)
        .map(screen => ({ geometry: screen.geometry, area: workspace.clientArea(KWin.MaximizeArea, screen, desktop) }));
}

function repositionWindow(column, row, wide) {
    const window = workspace.activeWindow;
    console.warn('Reposition window: key', column, row, wide, 'active:', window && window.caption,
        'normal:', window && window.normalWindow, 'resizeable:', window && window.resizeable);
    if (!window || !window.normalWindow || !window.resizeable) {
        return;
    }

    try {
        // Chosen on every keypress, as docking changes the screens.
        const screens = currentScreens();
        const layout = layouts.find(l => l.matches(screens));
        const newArea = layout.target(screens, column, row, wide);

        console.warn('Reposition window', version, layout.name, window.caption, JSON.stringify(window.frameGeometry),
            'target:', JSON.stringify(newArea));
        window.setMaximize(false, false);
        window.frameGeometry = newArea;
        workspace.raiseWindow(window);
    } catch (e) {
        console.warn('Reposition window failed:', e, e.stack);
    }
}

function register(name, shortcut, column, row, wide) {
    registerShortcut(name, name, shortcut, () => repositionWindow(column, row, wide));
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
registerShortcut("Minimize or restore window (NumLock on)", "Minimize or restore window (NumLock on)", "Meta+Num+0", toggleMinimized);
registerShortcut("Close window", "Close window", "Meta+Num+Del", closeActiveWindow);
registerShortcut("Close window (NumLock on)", "Close window (NumLock on)", "Meta+Num+,", closeActiveWindow);

keys.forEach(([key, digit, column, row]) => {
    const position = rowNames[row] + " " + columnNames[column];
    register("Reposition window " + position, "Meta+Num+" + key, column, row, false);
    register("Reposition window " + position + " (NumLock on)", "Meta+Num+" + digit, column, row, false);
    register("Reposition window wide " + position, "Meta+Shift+Num+" + key, column, row, true);
});

console.warn('Reposition window', version, 'loaded');
