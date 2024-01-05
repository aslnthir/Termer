#!/usr/bin/env sh

exec java \
  -jar ./node_modules/selenium-server/lib/runner/selenium-server-standalone-3.5.3.jar \
  -port 4445 \
  -role hub \
  -browserTimeout 10 \
  -sessionTimeout 5
