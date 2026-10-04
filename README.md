# KDE customization

See `./install.sh` for how to install some of the stuff.

## Restart stuck monitor backgrounds

Script to restart monitor backgrounds when they go black and unresponsive.

## Caps Lock as Control and Escape keys

Script to make Caps Lock a control key, and make control key emit Escape when pressed shortly.

## KWin scripts

### Installing from a package file

1. Run `./package.sh` to produce `kwinscript` files
2. Open KDE settings
3. Search Kwin Scripts
4. Bottom right corner: Install from file
5. Drop a `kwinscript` file onto the file name field of the file chooser

### Removing

1. log out of KDE
2. log in without KDE, e.g. on a textual virtual terminal
3. remove associated rows in `~/.config/kglobalshortcutsrc`

### Resize window to fixed size and position with Meta+X

I have three Lenovo monitors, each 1920x1200, turned to portraits, so 1200x1920, making up a desktop of 3600x1920 pixels.

Zooming windows in KDE only zooms them to one screen at a time.

This is my simplistic approach to resize a window onto the whole multiscreen desktop.

I was able to create this by following these instructions:
- https://develop.kde.org/docs/extend/plasma/kwin/
- https://www.reddit.com/r/kde/comments/uct9dp/comment/i6crg1m/?utm_source=share&utm_medium=web2x&context=3

### Resize window toward position

Package: `resize-window-by-numpad`. Install (or update) with `./install-resize-window-by-numpad.sh`; it works on Plasma 6 and is safe to re-run. Script output goes to the journal: `journalctl -t kwin_wayland_wrapper --since "-2min" | grep "Reposition window"`.

I like to work with multiple windows in predefined locations on my 3 vertical monitor setup.

The workspace is a grid of 3 columns (one per monitor) by 2 rows. With Meta held, the numpad keys are laid out like the grid:

| Key (numpad) | Window goes to |
|---|---|
| 7 / 8 / 9 | Top Left / Top Center / Top Right |
| 4 / 5 / 6 | Full Height Left / Center / Right |
| 1 / 2 / 3 | Bottom Left / Bottom Center / Bottom Right |

- `Meta+Num+<key>`: window fills that cell.
- `Meta+Shift+Num+<key>`: wide variant. Left and right cells widen to two columns, center to all three.
- `Meta+Num+Ins` (0): minimize the active window, or restore the one minimized last.
- `Meta+Num+Del` (,): close the active window.

A moved window is raised on top of the others.

#### Shortcut key names

With Meta held, KDE receives the numpad as navigation keys, so the shortcuts are registered under those names:
`Home Up PgUp / Left Clear Right / End Down PgDown` for 7 8 9 / 4 5 6 / 1 2 3 (also with Shift).
System Settings shows them like that, e.g. `Meta+Num+End` for key 1. Shortcuts already stored under an action name keep their stored keys when the script changes its defaults.
Other shortcuts on the same keys (e.g. a leftover KZones `Meta+Num+<n>`) take priority and leave this script's binding empty.
