#!/bin/bash

cd /var/www/html/entry-app

ls -la

cp -arp build/. . && rm -rf build 

systemctl reload nginx