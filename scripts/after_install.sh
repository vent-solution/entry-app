#!/bin/bash

cd /usr/share/nginx/html

ls -la

cp -arp build/. . && rm -rf build 

systemctl reload nginx