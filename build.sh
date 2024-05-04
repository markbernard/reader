#!/bin/bash
echo "Getting latest node modules"
#npm update

echo "Building angular application"
ng build

echo "Packaging"
cd dist/reader/browser
tar -czvf ../../../reader-1.0.tar.gz --transform 's,^,reader/,' *
cd -
