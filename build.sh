#!/bin/bash

BASEDIR=$(dirname $0)

#remove and copy assets folder

echo -e "\033[36m[update]\033[0m copying assets into deploy folder..."
rm -rf $BASEDIR/deploy
mkdir $BASEDIR/deploy
cp -R $BASEDIR/js $BASEDIR/deploy/js
cp -R $BASEDIR/css $BASEDIR/deploy/css
cp -R $BASEDIR/img $BASEDIR/deploy/img
#copy and replace index file
cp $BASEDIR/index.html $BASEDIR/deploy/index.html

#rewrite index.html for min.js

echo -e "\033[32m[minify]\033[0m rewriting script tag in" $BASEDIR"/deploy/templates/index.html"
#1. remove all current scripts
sed -i.bak '/<script.*\/script>/d' $BASEDIR/deploy/index.html
#2. replace <!-- MIN --> tag with min.js
sed -i.bak 's/<!-- MIN -->/<script src="js\/min.js"><\/script>/' $BASEDIR/deploy/index.html

#minify javascript with uglifyjs

echo -e "\033[32m[minify]\033[0m source:" $BASEDIR"/js/"
echo -e "\033[32m[minify]\033[0m output:" $BASEDIR"/deploy/js/min.js"
cat $BASEDIR/js/zepto.js \
$BASEDIR/js/main.js \
$BASEDIR/js/client.js \
$BASEDIR/js/db.js \
$BASEDIR/js/touch.js \
$BASEDIR/js/menu.js \
$BASEDIR/js/item.js \
$BASEDIR/js/view.js \
$BASEDIR/js/listView.js \
$BASEDIR/js/listItem.js \
$BASEDIR/js/todoView.js \
$BASEDIR/js/todoItem.js \
| uglifyjs -v -o $BASEDIR/deploy/js/min.js

#remove stuff no longer needed for deploy

#1. remove less files
echo -e "\033[33m[cleanup]\033[0m removing LESS files..."
find $BASEDIR/deploy/css -name *.less -exec rm {} \;

#2. remove uncompressed javascript files
echo -e "\033[33m[cleanup]\033[0m removing uncompressed js files..."
find $BASEDIR/deploy/js -type f ! -name min.js -exec rm {} \;

#3. remove index.html backup
echo -e "\033[33m[cleanup]\033[0m removing index.html backup..."
rm $BASEDIR/deploy/index.html.bak

#4. remove .DS_Store (if any)
echo -e "\033[33m[cleanup]\033[0m removing .DS_Store if any..."
find $BASEDIR/deploy -name .DS_Store -exec rm {} \;

echo -e "\033[31m[done]\033[0m"