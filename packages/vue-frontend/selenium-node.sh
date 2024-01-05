#!/usr/bin/env sh
exec java -jar node_modules/selenium-server/lib/runner/selenium-server-standalone-3.5.3.jar \
  -role node \
  -hub http://localhost:4445/wd/hub/register \
  -browserTimeout 10 \
  -sessionTimeout 5
