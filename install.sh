#!/bin/bash

set -e

cd $(dirname "$BASH_SOURCE")

mkdir -p ~/.config/autostart
cp *.desktop ~/.config/autostart/
./install-resize-window-by-numpad.sh

rsync -Sxbav home/ ~

sudo rsync -Sxbav etc/ /etc
