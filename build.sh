#!/bin/bash

BASEDIR=$(dirname $0)

#copy stuff to deploy folder

echo "\033[36m[update]\033[0m copying assets into deploy folder..."
rm -rf $BASEDIR/deploy
mkdir $BASEDIR/deploy
mkdir $BASEDIR/deploy/js
mkdir $BASEDIR/deploy/css
cp $BASEDIR/css/style.css $BASEDIR/deploy/css/style.css
cp -R $BASEDIR/img $BASEDIR/deploy/img
cp $BASEDIR/index.html $BASEDIR/deploy/index.html

#rewrite index.html for min.js

echo "\033[32m[minify]\033[0m rewriting script tag in" $BASEDIR"/deploy/templates/index.html"
#1. remove all current scripts
sed -i.bak '/<script.*\/script>/d' $BASEDIR/deploy/index.html
#2. replace <!-- MIN --> tag with min.js
sed -i.bak 's/<!-- MIN -->/<script src="js\/min.js"><\/script>/' $BASEDIR/deploy/index.html

#minify javascript with uglifyjs

echo "\033[32m[minify]\033[0m source:" $BASEDIR"/js/"
echo "\033[32m[minify]\033[0m output:" $BASEDIR"/deploy/js/min.js"
uglifyjs \
$BASEDIR/js/zepto.js \
$BASEDIR/js/main.js \
$BASEDIR/js/client.js \
$BASEDIR/js/db.js \
$BASEDIR/js/touch.js \
$BASEDIR/js/item.js \
$BASEDIR/js/unfold-dummy.js \
$BASEDIR/js/collection.js \
$BASEDIR/js/list-collection.js \
$BASEDIR/js/list-item.js \
$BASEDIR/js/todo-collection.js \
$BASEDIR/js/todo-item.js \
-v -o $BASEDIR/deploy/js/min.js

#remove stuff no longer needed for deploy

#1. remove index.html backup
echo "\033[33m[cleanup]\033[0m removing index.html backup..."
rm $BASEDIR/deploy/index.html.bak

#2. remove .DS_Store (if any)
echo "\033[33m[cleanup]\033[0m removing .DS_Store if any..."
find $BASEDIR/deploy -name .DS_Store -exec rm {} \;

echo "\033[31m[done]\033[0m"