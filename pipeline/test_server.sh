#!/usr/bin/env bash

echo "$USER"
cd server
npm ci
npm run test