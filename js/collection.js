// The C.Collection base object
// inehrited by C.ListCollection and C.TodoCollection

C.Collection = (function (raf) {

    var dragElasticity      = .45,
        friction            = .95,
        speedMultiplier     = 16,
        maxSpeed            = 35,
        diff                = 0.5, // the min distance from target an animation loop chain should reach before ending
        sortMoveSpeed       = 4.5;

    var beforeEditPosition  = 0; // used to record position before edit focus

    return {

        init: function (data) {

            this.y = 0;
            this.upperBound = 0;
            this.initiated = false;

            // the data object points directly to the data inside the DB module.
            this.data = data || C.db.data;

            this.items = [];
            this.render();
            this.initDummyItems();
            this.populateItems();

            this.resetDragStates();

        },

        resetDragStates: function () {

            this.pullingDown = false;
            this.pastPullDownThreshold = false;

            this.longPullingDown = false;
            this.longPullingUp = false;
            this.pastLongPullDownThreshold = false;
            this.pastLongPullUpThreshold = false;

        },

        initDummyItems: function () {

            // top dummy item
            this.topDummy = this.el.find('.dummy-item.top');
            this.topDummySlider = this.topDummy.find('.slider');
            this.topDummyText = this.topDummy.find('.title');
            this.topDummySliderStyle = this.topDummySlider[0].style;

        },

        populateItems: function () {

            var items = this.data.items,
                i = items.length,
                li;

            this.count = 0; // number of items (for C.TodoCollection this only counts items not done yet)
            this.hash = {}; // hash for getting items based on ID
            this.newIdFrom = i; // newly created item ID start from this

            while (i--) {
                this.addItem(items[i]);
            }

            this.hasDoneItems = this.items.length > this.count;
            this.updateBounds();

        },

        addItem: function (data) {

            var newItem = new this.itemType(data);

            newItem.collection = this;
            newItem.updatePosition();

            newItem.el
                .data('id', this.newIdFrom)
                .appendTo(this.el);

            this.items.push(newItem);
            this.hash[this.newIdFrom] = newItem;
            this.newIdFrom++;
            if (!newItem.data.done) this.count++;

            if (this.updateCount) {
                this.updateCount();
            }

            return newItem;

        },

        getItemById: function (id) {
            return this.hash[id];
        },

        getItemByOrder: function (order) {

            var i = this.items.length,
                item;
            while (i--) {
                item = this.items[i];
                if (item.data.order === order) {
                    return item;
                }
            }
        },

        getItemsBetween: function (origin, target) {

            var i = this.items.length,
                item,
                order,
                result = [];

            while (i--) {
                item = this.items[i];
                order = item.data.order;
                if ((order > origin && order <= target) || (order < origin && order >= target)) {
                    result.push(item);
                }
            }

            return result;

        },

        updateColor: function () {

            var i = this.items.length;
            while (i--) {
                this.items[i].updateColor();
            }

        },

        updatePosition: function () {

            var i = this.items.length;
            while (i--) {
                this.items[i].updatePosition();
            }

        },

        moveY: function (y) {

            this.y = y;
            this.style[C.client.transformProperty] = 'translate3d(0px,' + y + 'px, 0px)';

        },

        collapseAt: function (at, target) {

            var items = this.items,
                i = items.length,
                item,
                delIndex;

            while (i--) {
                item = items[i];
                if (item === target) {
                    if (target.deleted) delIndex = i; // found item to be deleted
                } else if (item.data.order > at && (!item.data.done || target.deleted)) {
                    item.data.order--;
                    item.updateColor();
                    item.updatePosition();
                } else {
                    item.updateColor();
                }
            }

            if (delIndex || delIndex === 0) { // if this item is deleted

                // remove its view object
                items.splice(delIndex, 1);
                this.updateBounds();

                // update count
                if (!target.data.done) {
                    this.count--;
                    if (this.updateCount) {
                        this.updateCount();
                    }
                }

                //update db data
                C.db.deleteItem(target.data, this.data);
                C.db.save();

            }

        },

        updateBounds: function (noMove) {

            this.height = this.items.length * C.ITEM_HEIGHT;
            this.upperBound = Math.min(0, C.client.height - (this.height + C.ITEM_HEIGHT));

            // move into bound when items are deleted
            if (this.y < this.upperBound && !noMove) {
                this.moveY(this.upperBound);
            }

        },

        onDragStart: function () {

            this.el.addClass('drag');

        },

        onDragMove: function (dy) {

            if (this.y + dy < this.upperBound || this.y + dy > 0) {
                dy *= dragElasticity;
            }

            this.moveY(this.y + dy);

            // pulling down, animate pull to create dummy item
            if (this.y > 0) {
                if (!this.pullingDown) {
                    this.pullingDown = true;
                    this.topDummy.show();
                }
                if (this.y <= C.ITEM_HEIGHT) {
                    if (this.pastPullDownThreshold) {
                        this.pastPullDownThreshold = false;
                        this.topDummyText.text('Pull to Create ' + this.itemTypeText);
                    }
                    var pct = this.y / C.ITEM_HEIGHT;
                    var r = Math.max(0, (1 - pct) * 90);
                    this.topDummySliderStyle[C.client.transformProperty] = 'rotateX(' + r + 'deg)';
                    this.topDummySliderStyle.opacity = pct / 2 + .5;
                } else {
                    if (!this.pastPullDownThreshold) {
                        this.pastPullDownThreshold = true;
                        this.topDummySliderStyle[C.client.transformProperty] = 'none';
                        this.topDummySliderStyle.opacity = 1;
                        this.topDummyText.text('Release to Create ' + this.itemTypeText);
                    }
                }
            } else {
                if (this.pullingDown) {
                    this.pullingDown = false;
                    this.topDummy.hide();
                }
            }

        },

        // the default on drag end
        // bounce the thing back into bounds
        // only gets called when no action is triggered
        onDragEnd: function (speed) {

            var col = this;
            speed = Math.max(-maxSpeed, Math.min(maxSpeed, speed * speedMultiplier));

            col.inMomentum = true;
            loop();

            function loop () {

                if (C.touch.isDown) {
                    endLoop();
                    return;
                }

                if (col.y < col.upperBound - diff) { // dragged over bottom
                    col.y += (col.upperBound - col.y) / 5; // apply elastic bounce back
                    speed *= .85; // apply additional friction
                    if (col.y < col.upperBound - diff) {
                        raf(loop);
                        render();
                    } else {
                        col.moveY(col.upperBound);
                        endLoop();
                    }
                } else if (col.y > diff) { // dragged over top
                    col.y *= .8;
                    speed *= .85;
                    if (col.y > diff) {
                        raf(loop);
                        render();
                    } else {
                        col.moveY(0);
                        endLoop();
                    }
                } else if (Math.abs(speed) > 0.1) { // normal moving
                    raf(loop);
                    render();
                } else { // natural stop due to friction
                    endLoop();
                }

            }

            function endLoop () {
                col.el.removeClass('drag');
                col.inMomentum = false;
                col.topDummy.hide();
                if (col.bottomSwitch) col.bottomSwitch.hide();
            }

            function render () {
                col.moveY(col.y + speed);
                speed *= friction;
                if (col.y >= 0) {
                    var pct = col.y / C.ITEM_HEIGHT;
                    var r = Math.max(0, (1 - pct) * 90);
                    col.topDummySliderStyle[C.client.transformProperty] = 'rotateX(' + r + 'deg)';
                    col.topDummySliderStyle.opacity = pct / 2 + .5;
                }
            }

        },

        onTap: function () {

            // create new item at bottom
            if (this.hasDoneItems) {
                // the animation would be a middle fold
                this.createItemInBetween();
            } else {
                this.createItemAtBottom();
            }

        },

        // need better doc here, target is an Item

        sortMove: function (dir, target) {
            
            var col = this,
                dy  = dir * sortMoveSpeed;

            col.sortMoving = true;
            col.el.addClass('drag');
            loop();

            function loop () {

                if (!col.sortMoving) {
                    col.el.removeClass('drag');
                    return;
                }

                raf(loop);

                var cty = Math.max(col.upperBound, Math.min(0, col.y + dy));

                target.moveY(target.y - (cty - col.y));
                target.checkSwap();

                col.moveY(cty);

            }

        },

        onEditStart: function (at, noRemember) {

            beforeEditPosition = noRemember ? 0 : this.y;

            // Reason for using a setTimeout here: (or at least what I think is the case)
            // It seems in iOS browsers when you trigger the keyboard for the first time,
            // there's some heavy initialization work going on. This function is called
            // from the function that was initially triggered by the input focus event,
            // so the css transitions triggered here will be blocked. I'm avoiding that
            // by putting the class changes into a new call stack.

            var t = this;
            setTimeout(function () {

                // If on desktop, move currently focused item to top.
                // mobile devices will do auto page re-positioning on focus
                // and since behavior across different devices will vary,
                // better leave it alone here.
                if (!C.client.isTouch) {
                    t.moveY(-at * C.ITEM_HEIGHT);
                }

                if (noRemember) {
                    t.el
                        .removeClass('drag')
                        .addClass('ease-out');
                    t.moveY(0);
                    t.onTransitionEnd(function () {
                        t.el.removeClass('ease-out');
                    });
                }
                t.el.addClass('shade');
            }, 0);

        },

        onEditDone: function (callback) {

            if (!C.client.isTouch) {
                this.moveY(beforeEditPosition);
            }

            this.el.removeClass('shade');
            if (this.items.length === 1) {
                callback();
            } else {
                // passing in {noStrict: true}
                // must avoid (e.target === this) checking here because
                // triggered transition doesn't happen on itself
                this.onTransitionEnd(callback, true);
            }

        },

        onPinchOutStart: function () {
            console.log('pinchOut start');
        },

        onPinchOutMove: function (i, touch) {
            
        },

        onPinchOutCancel: function () {
            console.log('pinchOut cancel');
        },

        onPinchOutEnd: function () {
            console.log('pinchOut end');
        },

        createItemAtTop: function () {

            // hide and reset dummy item
            this.topDummy.hide();
            this.topDummyText.text('Pull to Create ' + this.itemTypeText);

            // move the whole thing up one row
            this.moveY(this.y - C.ITEM_HEIGHT);

            // move all items down one row
            this.el.addClass('instant');
            var i = this.items.length,
                item;
            while (i--) {
                item = this.items[i];
                item.data.order++;
                item.moveY(item.y + C.ITEM_HEIGHT);
            }

            var col = this;
            setTimeout(function () {
                col.el.removeClass('instant');
            }, 0);

            var newData = {
                title: '',
                order: 0
            };

            // add the data to db
            C.db.addItem(newData, this.data);

            // create the item. It needs to be created from the same data object for binding
            var newItem = this.addItem(newData);

            this.updateColor();
            this.updateBounds();

            // passing in noRemember: true. do not remember starting position
            newItem.onEditStart(true);

        },

        createItemAtBottom: function () {

            var newData = {
                title: '',
                order: this.count
            };

            C.db.addItem(newData, this.data);

            var newItem = this.addItem(newData);
            this.updateColor();
            this.updateBounds();

            newItem.el.addClass('dummy-item bottom');

            // Focus in advance to get around an iOS caveat:
            // iOS only allows field focus to be triggered within a call stack
            // that's directly initiated by user input.
            newItem.el.find('.field').show().focus();

            // Also, an interesting discovery here:
            // If a field has transform: rotateX(90deg) when it's focused on,
            // the iOS keyboard will be triggered but no page re-positioning happens.
            // So here I have to set the new item's slider transform to be rotateX(-91deg)
            // to properly trigger the page re-positioning.

            setTimeout(function () {
                newItem.el.find('.slider')[0].style[C.client.transformProperty] = 'rotateX(0deg)';
                newItem.onTransitionEnd(function () {
                    newItem.el.removeClass('dummy-item bottom');
                    newItem.onEditStart();
                }, true);
            }, 50);

        },

        createItemInBetween: function () {
            
            var newData = {
                title: '',
                order: this.count
            };

            C.db.addItem(newData, this.data);

            var newItem = this.addItem(newData);
            this.updateColor();
            this.updateBounds();

            // dummy
            var lastUndone = this.getItemByOrder(this.count - 1),
                color = lastUndone.el.find('.slider').css('background-color'),
                dummy = new C.UnfoldDummy({
                    order: this.count,
                    color: color
                });
            this.el.append(dummy.el);

            newItem.el
                .addClass('drag')
                .css('opacity', .01) // hack hack hack...
                .find('.field').show().focus(); // trigger keyboard in advance

            var col = this;
            setTimeout(function () {
                // push done items 1 slot down
                var i = col.items.length,
                    item;

                while (i--) {
                    item = col.items[i];
                    if (item.data.done) {
                        item.data.order++;
                        item.moveY(item.y + C.ITEM_HEIGHT);
                    }
                }

                dummy.el.addClass('open');
                dummy.el.on(C.client.transitionEndEvent, function () {
                    dummy.el.off(C.client.transitionEndEvent);
                    newItem.el.css('opacity', '');
                    setTimeout(function () {
                        newItem.el.removeClass('drag')
                        newItem.onEditStart();
                        dummy.el.remove();
                        dummy = null;
                    }, 0);
                });
            }, 50);

        },

        // listen for webkitTransitionEnd
        onTransitionEnd: function (callback, noStrict) {

            var t = this;
            t.el.on(C.client.transitionEndEvent, function (e) {
                if (e.target !== this && !noStrict) return;
                t.el.off(C.client.transitionEndEvent);
                callback();
            });

        }

    };

}(C.raf));