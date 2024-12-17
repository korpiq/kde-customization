#!/bin/bash

for P in */metadata.json
do
  D=$(dirname "$P")
  zip -r "$D.zip" "$D" && mv -f "$D.zip" "$D.kwinscript"
done
