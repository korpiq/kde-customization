#!/bin/bash

set -e

cd $(dirname "$BASH_SOURCE")

kpackagetool5 --type=KWin/Script -i resize-window-to-3600x1920
kwriteconfig5 --file kwinrc --group Plugins --key resizeTo3600x1920x0y0Enabled true
qdbus org.kde.KWin /KWin reconfigure
