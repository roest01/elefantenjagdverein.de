#!/usr/bin/env bash
echo "Starting run.sh"

echo "Starting nginx"
exec nginx -g "daemon off;"

exit 0;