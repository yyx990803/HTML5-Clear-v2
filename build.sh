#!/bin/bash

BASEDIR=$(dirname $0)

update () {

	echo -e "\033[36m[update]\033[0m copying from local server folder to" $BASEDIR/

	#remove and copy assets folder
	rm -rf $BASEDIR/assets
	cp -R /Users/yyou/Sites/assets $BASEDIR/

	#copy and replace index file
	cp /Users/yyou/Sites/index.html $BASEDIR/index.html

}

deploy () {

	#remove and copy assets folder

	echo -e "\033[36m[update]\033[0m copying assets into deploy folder..."
	rm -rf $BASEDIR/deploy/static/assets
	cp -R $BASEDIR/assets $BASEDIR/deploy/static/assets
	#copy and replace index file
	cp $BASEDIR/index.html $BASEDIR/deploy/templates/index.html

	#rewrite index.html for min.js

	echo -e "\033[32m[minify]\033[0m rewriting script tag in" $BASEDIR"/deploy/templates/index.html"
	#1. remove all current scripts
	sed -i.bak '/<script.*\/script>/d' $BASEDIR/deploy/templates/index.html
	#2. replace <!-- MIN --> tag with min.js
	sed -i.bak 's/<!-- MIN -->/<script src="assets\/js\/min.js"><\/script>/' $BASEDIR/deploy/templates/index.html

	#minify javascript with uglifyjs

	echo -e "\033[32m[minify]\033[0m source:" $BASEDIR"/assets/js/"
	echo -e "\033[32m[minify]\033[0m output:" $BASEDIR"/deploy/static/assets/js/min.js"
	cat $BASEDIR/assets/js/zepto.js \
	$BASEDIR/assets/js/main.js \
	$BASEDIR/assets/js/data.js \
	$BASEDIR/assets/js/client.js \
	$BASEDIR/assets/js/stage.js \
	$BASEDIR/assets/js/utils.js \
	$BASEDIR/assets/js/templates.js \
	$BASEDIR/assets/js/card.js \
	$BASEDIR/assets/js/cardGroup.js \
	$BASEDIR/assets/js/nowSuggestions.js \
	$BASEDIR/assets/js/menu.js \
	$BASEDIR/assets/js/popup.js \
	$BASEDIR/assets/js/voice.js \
	$BASEDIR/assets/js/clock.js \
	$BASEDIR/assets/js/bg.js \
	$BASEDIR/assets/js/touch.js \
	| uglifyjs -v -o $BASEDIR/deploy/static/assets/js/min.js

	#remove stuff no longer needed for deploy

	#1. remove less files
	echo -e "\033[33m[cleanup]\033[0m removing LESS files..."
	find $BASEDIR/deploy/static/assets/css -name *.less -exec rm {} \;

	#2. remove uncompressed javascript files
	echo -e "\033[33m[cleanup]\033[0m removing uncompressed js files..."
	find $BASEDIR/deploy/static/assets/js -type f ! -name min.js -exec rm {} \;

	#3. remove index.html backup
	echo -e "\033[33m[cleanup]\033[0m removing index.html backup..."
	rm $BASEDIR/deploy/templates/index.html.bak

	#4. remove .DS_Store (if any)
	echo -e "\033[33m[cleanup]\033[0m removing .DS_Store if any..."
	find $BASEDIR/deploy -name .DS_Store -exec rm {} \;

	echo -e "\033[31m[done]\033[0m"

}

if test "$1" == 'deploy'
	then
		deploy
	else
	if test "$1" == 'update'
		then
			update
		else
			update
			deploy
		fi
fi