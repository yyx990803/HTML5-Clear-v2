C.TodoCollection = function (data, listItem) {
    
    C.log('TodoCollection: init <' + data.title + '>');

    this.stateType = C.states.TODO_COLLECTION_VIEW;
    this.base = C.Collection;
    this.itemType = C.TodoItem;
    this.itemTypeText = 'Item';

    this.listItem = listItem || C.listCollection.getItemByOrder(data.order);

    // apply shared init
    this.base.init.apply(this, arguments);

};

C.TodoCollection.prototype = {

    __proto__: C.Collection,

    render: function () {

        this.el = $('<div class="collection">\
                <div class="top-switch">\
                    <img class="arrow" src="img/arrow.png"> <span class="text">Switch To Lists</span>\
                </div>\
                <div class="bottom-switch">\
                    <div class="drawer"><img class="arrow-small" src="img/arrow-small.png"></div>\
                    <span class="text">Pull to Clear</span>\
                </div>\
                <div class="item dummy-item top">\
                    <div class="slider" style="background-color:rgb(235,0,23)"><div class="inner">\
                        <span class="title">Pull to Create Item</span>\
                    </div></div>\
                </div>\
            </div>');

        this.style = this.el[0].style;

        // top switch
        this.topSwitch = this.el.find('.top-switch');
        this.topArrow = this.topSwitch.find('.arrow');
        this.topText = this.topSwitch.find('.text');

        // bottom switch
        this.bottomSwitch = this.el.find('.bottom-switch');
        this.drawer = this.bottomSwitch.find('.drawer');
        this.smallArrowStyle = this.bottomSwitch.find('.arrow-small')[0].style;

    },

    load: function (at, noAnimation) {

        this.initiated = true;

        var t = this;

        t.updateColor();
        t.resetTopSwitch();

        if (noAnimation) {

            t.updatePosition();
            t.el.appendTo(C.$wrapper);

        } else {

            if (t.initiated) {
                t.el.remove();
            }

            // move to match the position of the ListItem
            t.moveY(at * C.ITEM_HEIGHT + C.listCollection.y);
            // squeeze all items at top
            var i = t.items.length;
            while (i--) { t.items[i].moveY(0) }

            t.el
                .appendTo(C.$wrapper)
                .removeClass('drag');

            // wait for repaint
            setTimeout(function () {

                // move to top
                t.moveY(0);
                // expand items to their right positions
                t.updatePosition();

            }, 0);

        }

    },

    floatUp: function (target) {

        var i = this.items.length,
            item,
            below = target.data.order;
        target.data.order = this.count - 1;

        while (i--) {
            item = this.items[i];
            if (item === target) {
                item.updateColor();
                item.updatePosition(true);
            } else if (item.data.done && item.data.order < below) {
                item.data.order++;
                item.updatePosition();
            } else {
                item.updateColor();
            }
        }

    },

    updateCount: function () {

        this.listItem.count = this.count;
        this.listItem.updateCount();
        this.hasDoneItems = this.items.length > this.count;

    },

    onDragMove: function () {

        this.base.onDragMove.apply(this, arguments);

        var lc = C.listCollection;

        // long pull down
        if (this.y >= C.ITEM_HEIGHT * 2) {
            if (!this.longPullingDown) {
                this.longPullingDown = true;
                this.topSwitch.show();
                this.topDummy.css('opacity', '0');
            }
            lc.moveY(this.y - lc.height - C.ITEM_HEIGHT * 2);
        } else {
            if (this.longPullingDown) {
                this.longPullingDown = false;
                this.topDummy.css('opacity', '1');
                this.topSwitch.hide();
                lc.moveY(-lc.height - C.ITEM_HEIGHT * 2);
            }
        }

        // long pull up
        if (this.y < this.upperBound) {

            if (!this.longPullingUp) {

                this.longPullingUp = true;

                var pos = Math.max(C.client.height, this.height + C.ITEM_HEIGHT) + C.ITEM_HEIGHT * 2;
                this.bottomSwitch[0].style[C.client.transformProperty] = 'translate3d(0px,' + pos + 'px, 0px)';
                this.bottomSwitch.show();

                if (this.hasDoneItems) {
                    this.bottomSwitch.removeClass('empty');
                    this.drawer.removeClass('full');
                } else {
                    this.bottomSwitch.addClass('empty');
                }
            }

            // move the small arrow
            if (this.hasDoneItems) {
                var offset = (this.upperBound - this.y) / (2 * C.ITEM_HEIGHT) * (C.ITEM_HEIGHT + 15);
                this.smallArrowStyle[C.client.transformProperty] = 'translate3d(0,' + offset + 'px, 0)';
            }

            // check threshold
            if (this.y < this.upperBound - C.ITEM_HEIGHT * 2) {
                if (!this.pastLongPullUpThreshold) {
                    this.pastLongPullUpThreshold = true;
                    this.drawer.addClass('full');
                }
            } else {
                if (this.pastLongPullUpThreshold) {
                    this.pastLongPullUpThreshold = false;
                    this.drawer.removeClass('full');
                }
            }

        } else {
            if (this.longPullingUp) {
                this.longPullingUp = false;
                this.bottomSwitch.hide();
            }
        }

    },

    onDragEnd: function () {

        this.resetDragStates();

        if (this.y >= C.ITEM_HEIGHT * 2) {
            this.onPullDown();
            return; // cancel default bounce back
        } else if (this.y >= C.ITEM_HEIGHT) {
            this.createItemAtTop();
            return;
        } else if (this.y <= this.upperBound - C.ITEM_HEIGHT * 2) {
            this.onPullUp();
        }

        this.base.onDragEnd.apply(this, arguments);

    },

    // go back up to list
    onPullDown: function () {

        var lc = C.listCollection;

        // show the faded item
        var fadedItem = lc.getItemByOrder(lc.openedAt);
        if (fadedItem) fadedItem.el.removeClass('fade');

        lc.el.removeClass('drag');
        lc.moveY(0);

        this.el.removeClass('drag');
        this.moveY(Math.max(lc.height, C.client.height) + C.ITEM_HEIGHT * 2);

        C.setCurrentCollection(lc);
        C.setLastTodoCollection(this);

        var t = this;
        t.onTransitionEnd(function () {
            t.positionForPullUp();
        });

    },

    // clear done items!
    onPullUp: function () {

        if (!this.hasDoneItems) return;

        // calculate the distance to drop
        var dist;
        var unDoneHeight = this.height - (this.items.length - this.count) * C.ITEM_HEIGHT;
        if (unDoneHeight > C.client.height) {
            dist = C.ITEM_HEIGHT * 2;
        } else {
            dist = C.client.height - unDoneHeight + C.ITEM_HEIGHT * 2;
        }

        // clear y'all
        var i = this.items.length,
            item;

        while (i--) {
            item = this.items[i];
            if (item.data.done) {
                item.clear(dist);
                this.items.splice(i, 1);
                C.db.deleteItem(item.data, this.data);
            }
        }

        this.hasDoneItems = false;
        this.updateBounds(true);

        C.db.save();

    },

    onPinchInStart: function () {
        console.log('pinchIn start');
    },

    onPinchInMove: function (i, touch) {

    },

    onPinchInEnd: function () {
        console.log('pinchIn end');
    },

    onPinchInCancel: function () {
        console.log('pinchIn cancelled');
    },

    positionForPullUp: function () {

        this.el.addClass('drag');
        this.moveY(C.client.height + C.ITEM_HEIGHT);
        this.topText.text(this.data.title);
        this.topArrow.removeClass('down');
        this.topDummy
            .hide()
            .css('opacity', '1');
        this.topDummyText.text('Pull to Create ' + this.itemTypeText);

    },

    resetTopSwitch: function () {

        this.topSwitch.hide();
        this.topText.text('Switch to Lists');
        this.topArrow.removeClass('down');

    }

};