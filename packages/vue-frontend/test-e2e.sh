#!/usr/bin/env bash

# Load environment variables for e2e testing
. .env.e2e

# Kill processes in process group on Ctrl-C and SIGTERM
trap 'setsid kill -- -$PGID' SIGINT SIGTERM

PGID=$(ps -o pgid= $$ | grep -o [0-9]*)

./selenium-hub.sh &
./selenium-node.sh &
(
  cd ..
  . virtualenv/bin/activate
  # Ideally use production mode here. For now, debug mode is used to
  # avoid a problem where Django reports
  #   `ValueError("Missing staticfiles manifest entry for ...")`
  DJANGO_DEBUG=1 ./manage.py runserver $DJANGO_BACKEND_ADDRESS:$DJANGO_BACKEND_PORT
) &
wait
