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

# Reload the script in the running KWin so code changes take effect now.
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.unloadScript "$ID" >/dev/null || true
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
