#!/usr/bin/env bash

export DISPLAY=':99.0'
Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &

echo "$USER"
cd client
npm ci --cache .npm --prefer-offline
npm ci
npm run test