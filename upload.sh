#!/bin/bash

# Honduras

echo "Uploading Honduras files with Surge"

cp HN-CNAME CNAME
cp js/hn-paystructure.js js/paystructure.js
surge
rm CNAME js/paystructure.js


echo "Uploading Guatemala files with Surge"

cp GT-CNAME CNAME
cp js/gt-paystructure.js js/paystructure.js
surge 
rm CNAME js/paystructure.js




