#!/bin/bash
# Idempotent install of the resize-window-by-numpad KWin script (Plasma 6).
# Safe to re-run: installs or upgrades, enables, and reloads the running script.

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

SRC=resize-window-by-numpad
ID=$(grep -oP '"Id":\s*"\K[^"]+' "$SRC/metadata.json")

if [ -d "$HOME/.local/share/kwin/scripts/$ID" ]; then
    kpackagetool6 --type=KWin/Script --upgrade "$SRC"
else
    kpackagetool6 --type=KWin/Script --install "$SRC"
fi

kwriteconfig6 --file kwinrc --group Plugins --key "${ID}Enabled" true

# Unload the script, and forget its stored shortcut bindings so that the
# default bindings in main.js are registered again when it is reloaded.
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.unloadScript "$ID" >/dev/null || true

script_actions() {
    awk -F= '/^\[/ { in_kwin = ($0 == "[kwin]"); next }
        in_kwin && /^(Reposition window |Minimize or restore window[ =]|Close window[ =])/ { print $1 }' \
        ~/.config/kglobalshortcutsrc
}

script_actions | while IFS= read -r action; do
    busctl --user call org.kde.kglobalaccel /kglobalaccel org.kde.KGlobalAccel \
        unregister ss kwin "$action" >/dev/null
done

qdbus6 org.kde.KWin /KWin reconfigure

echo "Installed and enabled: $ID"
loaded=false
for _ in 1 2 3 4 5 6 7 8 9 10; do
    loaded=$(qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.isScriptLoaded "$ID")
    [ "$loaded" = true ] && break
    sleep 0.3
done
echo "Loaded: $loaded"
echo "Follow script output with: journalctl -f -t kwin_wayland   (or: journalctl --user -f | grep -i reposition)"
