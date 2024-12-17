#!/bin/bash

DEBS=$(dpkg-query -Wf '${Package;-50} ${Version;-30} ${Status;-26} ${binary:Synopsis;-40}\n' '*nvidia*' | grep -v ' not-installed ' | sed 's/[^ ]*install.*//')
if [ -n "$DEBS" ]
then
  echo "Installed:"
  echo "$DEBS"
  if echo " $* " | grep ' --purge ' 
  then
    while ! sudo dpkg -P $(echo "$DEBS" | sed 's/ .*//')
    do
      echo -n Retrying...
      sleep 3 || break
      echo
    done
  else
    echo 
    echo "Above packages can be removed with: $0 --purge"
  fi
  echo
fi

echo "Available:"
apt-cache search nvidia-driver | grep ^nvidia-driver

NEW=$(echo " $* " | sed 's/--[^ ]* //g; s/ //g')
if [ -n "$NEW" ]
then
  sudo apt install $NEW
else
  echo
  echo "Install one of the above with: $0 [--qt] nvidia-drive-XXX"
fi

if echo " $* " | grep ' --qt '
then
  sudo software-properties-qt
fi
true
