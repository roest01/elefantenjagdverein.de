#!/usr/bin/env bash
echo "Starting run.sh"


echo "Starting nginx"
exec nginx -g "daemon off;" &

echo "Starting server"
cd /var/www/html
npm start

exit 0;