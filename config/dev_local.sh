#!/usr/bin/env bash

redis-server /usr/local/etc/redis.conf

node server/server.js