#!/bin/zsh
targetWorkSpace="$1"
program="$2"
if (ps axo pid,command | awk '{print $1,$2}' | grep "$program" >/dev/null); then
  i3-msg workspace $targetWorkSpace
  echo "ok"
else
  i3-msg workspace $targetWorkSpace
  echo "not ok"
  $program & disown $program
fi
