#!/usr/bin/env bash

echo "$USER"
cd server
ls
ls node_modules
npm ci --cache ../.npm --prefer-offline
npm run test