#!/usr/bin/env bash

echo "$USER"
cd client
npm ci
npm run test