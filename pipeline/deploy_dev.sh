#!/usr/bin/env bash

#server
cd server
rm -rf /var/www/dev/server/*
cp -r out /var/www/dev/server
cp -r node_modules /var/www/dev/server
cp /var/www/dev/.env/server/* /var/www/dev/server
pm2 reload dev_server

#client
cd ../client
npm run build:electron -- --win