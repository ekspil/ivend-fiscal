#!/bin/bash
cd /app

npm run migrate
if [ "$?" -ne "0" ]; then
  echo "Failed to migrate"
  exit 1
fi

$@