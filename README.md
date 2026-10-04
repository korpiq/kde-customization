# KDE customization

Each feature has its own install script, `install-*.sh`; run only the ones you want.

## Restart stuck monitor backgrounds

Script to restart monitor backgrounds when they go black and unresponsive.

## Caps Lock as Control and Escape keys

Moved to `~/.bash_utils/setup-keyd`, which uses keyd.

## Hibernate

`./install-hibernate.sh` installs a polkit rule allowing hibernation without authentication.

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

### Resize window toward position

Package: `resize-window-by-numpad`. Install (or update) with `./install-resize-window-by-numpad.sh`; it works on Plasma 6 and is safe to re-run. Script output goes to the journal: `journalctl -t kwin_wayland_wrapper --since "-2min" | grep "Reposition window"`.

I have three Lenovo monitors, each 1920x1200, turned to portraits, so 1200x1920, making up a desktop of 3600x1920 pixels.
I like to work with multiple windows in predefined locations on this setup.

The workspace is a grid of 3 columns (one per monitor) by 2 rows. With Meta held, the numpad keys are laid out like the grid:

| Key (numpad) | Window goes to |
|---|---|
| 7 / 8 / 9 | Top Left / Top Center / Top Right |
| 4 / 5 / 6 | Full Height Left / Center / Right |
| 1 / 2 / 3 | Bottom Left / Bottom Center / Bottom Right |

- `Meta+Num+<key>`: window fills that cell.
- `Meta+Shift+Num+<key>`: wide variant. Left and right cells widen to two columns, center to all three (`Meta+Shift+Num+Clear` makes the window cover the whole desktop).
- `Meta+Num+Ins` (0): minimize the active window, or restore the one minimized last.
- `Meta+Num+Del` (,): close the active window.

A moved window is raised on top of the others.

#### Shortcut key names

The shortcuts work with NumLock on or off. KDE receives the numpad as digits with NumLock on and as navigation keys with NumLock off, and one action cannot have both, so each is registered twice: `Meta+Num+<digit>` as "... (NumLock on)", and `Meta+Num+Home Up PgUp / Left Clear Right / End Down PgDown` (7 8 9 / 4 5 6 / 1 2 3) for NumLock off. Shift flips NumLock, so the Shift shortcuts only need the navigation key names.
System Settings shows them like that, e.g. `Meta+Num+End` for key 1. Shortcuts already stored under an action name keep their stored keys when the script changes its defaults; the installer clears them so the defaults apply.
Other shortcuts on the same keys (e.g. a leftover KZones `Meta+Num+<n>`) take priority and leave this script's binding empty.
