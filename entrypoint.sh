#!/bin/sh
# Fix permissions for /data directory if it exists
if [ -d /data ]; then
  chmod 777 /data 2>/dev/null || true
  chmod 777 /data/* 2>/dev/null || true
fi

# Start the application
exec node src/index.js
