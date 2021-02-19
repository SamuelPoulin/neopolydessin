#!/usr/bin/env bash

#server
cd server
rm -rf /var/www/prod/server/*
cp -r out /var/www/prod/server
cp -r node_modules /var/www/prod/server
cp /var/www/prod/.env/server/* /var/www/prod/server
pm2 reload prod_server