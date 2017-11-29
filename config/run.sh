#!/usr/bin/env bash
echo "Starting run.sh"

echo "Starting redis"
exec redis-server &

echo "Starting nginx"
exec nginx -g "daemon off;"

exit 0;