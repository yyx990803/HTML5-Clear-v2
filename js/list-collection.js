C.listCollection = {

    __proto__: C.Collection,

    init: function () {

        C.log('ListCollection: init');

        this.stateType = C.states.LIST_COLLECTION_VIEW;
        this.base = C.Collection;
        this.itemType = C.ListItem;
        this.itemTypeText = 'List';

        // apply shared init
        this.base.init.apply(this, arguments);

        // private init jobs
        this.updateColor();
        this.updatePosition();

        this.openedAt = -1; // used to record currently opened list

    },

    render: function () {

        this.el = $('<div id="list-collection" class="collection">\
                        <div class="credit">Made by Evan You <br> Original iOS app by Realmac</div>\
                        <div class="item dummy-item top list-item empty">\
                            <div class="slider" style="background-color:rgb(23,128,247)"><div class="inner">\
                                <span class="title">Pull to Create List</span>\
                                <div class="count">0</div>\
                            </div></div>\
                        </div>\
                    </div>');

        this.style = this.el[0].style;

    },

    load: function () {

        this.initiated = true;
        this.el.appendTo(C.$wrapper);

    },

    // open when a ListItem is tapped.
    open: function (at) {

        this.openedAt = at;

        var t = this;

        // move current and up to top, drop anything below
        var i = t.items.length,
            item,
            ty;
        while (i--) {
            item = t.items[i];
            if (item.data.order <= at) {
                ty = (item.data.order - at) * C.ITEM_HEIGHT - t.y;
            } else {
                ty = C.client.height + (item.data.order - at) * C.ITEM_HEIGHT - t.y;
            }
            item.moveY(ty);
        }

        // listen for transition end on the last item
        item.onTransitionEnd(function () {
            t.positionForPulldown();
        });

    },

    // position the collection for pulldown from a TodoCollection.
    positionForPulldown: function () {

        var t = this;
        t.el.hide();

        setTimeout(function () {
            t.updatePosition();
            t.moveY(-t.height - C.ITEM_HEIGHT);
            t.el
                .addClass('drag')
                .show();
        }, 0);

    },

    // position the collection for pinch in from a TodoCollection.
    positionForPinchIn: function () {

    },

    onDragMove: function () {

        this.base.onDragMove.apply(this, arguments);

        var ltc = C.lastTodoCollection;

        // long pull down
        if (this.y <= this.upperBound) {
            if (!this.longPullingUp) {
                this.longPullingUp = true;
                ltc.el.addClass('drag');
                ltc.topSwitch.show();
            }
            ltc.moveY(this.y + Math.max(this.height + C.ITEM_HEIGHT * 2, C.client.height + C.ITEM_HEIGHT));

            if (this.y < this.upperBound - C.ITEM_HEIGHT) {
                if (!this.pastLongPullDownThreshold) {
                    this.pastLongPullDownThreshold = true;
                    ltc.topArrow.addClass('down');
                }
            } else {
                if (this.pastLongPullDownThreshold) {
                    this.pastLongPullDownThreshold = false;
                    ltc.topArrow.removeClass('down');
                }
            }

        } else {
            if (this.longPullingUp) {
                this.longPullingUp = false;
                ltc.topSwitch.hide();
                ltc.moveY(C.client.height + C.ITEM_HEIGHT);
            }
        }

    },

    onDragEnd: function () {

        this.resetDragStates();

        if (this.y >= C.ITEM_HEIGHT) {
            this.createItemAtTop();
            return;
        } else if (this.y <= this.upperBound - C.ITEM_HEIGHT) {
            this.onPullUp();
            return; // cancel default bounce back
        } else if (this.y <= this.upperBound) {
            // pull up cancelled
            var ltc = C.lastTodoCollection;
            ltc.el.removeClass('drag').addClass('ease-out');
            ltc.moveY(C.client.height + C.ITEM_HEIGHT);
            ltc.onTransitionEnd(function () {
                ltc.el.removeClass('ease-out');
            });
        }

        this.base.onDragEnd.apply(this, arguments);

    },

    onPullUp: function () {
        
        var ltc = C.lastTodoCollection;

        ltc.el.removeClass('drag');
        ltc.moveY(0);

        this.el.removeClass('drag');
        this.moveY(Math.min(-this.height, -C.client.height) - C.ITEM_HEIGHT * 2);

        C.setCurrentCollection(ltc);

        ltc.onTransitionEnd(function () {
            ltc.resetTopSwitch();
        });

        var t = this;
        t.onTransitionEnd(function () {
            t.positionForPulldown();
        });

    }

};