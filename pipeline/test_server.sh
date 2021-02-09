#!/usr/bin/env bash

echo "$USER"
cd server
npm ci --cache .npm --prefer-offline
npm ci
npm run test