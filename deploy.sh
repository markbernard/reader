#!/bin/bash
ng build
echo "Copying files"
cp -r ./dist/reader/browser/* /var/www/html/reader/
echo "Copy conplete"
