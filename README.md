# KDE customization

See `./install.sh` for how to install some of the stuff.

## Restart stuck monitor backgrounds

Script to restart monitor backgrounds when they go black and unresponsive.

## Caps Lock as Control and Escape keys

Script to make Caps Lock a control key, and make control key emit Escape when pressed shortly.

## KWin scripts

### Installing

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

I like to work with multiple windows in predefined locations on my 3 vertical monitor setup.

This script resizes and relocates current window toward the corner, edge, or center of workspace associated with numpad key locations.

If the window is already at that location, its size is toggled between the default and a reasonably bigger one.
