#!/bin/sh

killall xcape 2>/dev/null || true
# setxkbmap -option caps:ctrl_modifier # not working, using kde Caps setting instead
xcape -e 'Caps_Lock=Escape;Control_R=Escape;Pause=Tab' -t 200
