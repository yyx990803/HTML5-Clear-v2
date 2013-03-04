// The C.Item base object
// inehrited by C.ListItem and C.TodoItem

C.Item = (function (raf) {

    var leftBound = -C.ITEM_HEIGHT,
        rightBound = C.ITEM_HEIGHT;

    var upperSortMoveThreshold = C.ITEM_HEIGHT * 1.5,
        lowerSortMoveThreshold = C.ITEM_HEIGHT * 2.5;

    return {

        init: function (data) {

            this.x = 0;
            this.y = data.order * C.ITEM_HEIGHT;
            this.data = data;

            this.render();

            // cache references to elements and styles

            this.style = this.el[0].style;
            this.slider = this.el.find('.slider');
            this.sliderStyle = this.slider[0].style;

            // cross and check

            this.check = $('<img class="check drag" src="img/check.png">');
            this.cross = $('<img class="cross drag" src="img/cross.png">');
            this.el
                .append(this.check)
                .append(this.cross);

            this.checkStyle = this.check[0].style;
            this.crossStyle = this.cross[0].style;

            this.checkX = 0;
            this.crossX = 0;
            this.checkO = 0;
            this.crossO = 0;

            // editing related

            this.title = this.el.find('.title');
            this.field = this.el.find('.field');
            var t = this;
            this.field
                .on('blur', function () {
                    t.onEditDone();
                })
                .on('keyup', function (e) {
                    if (e.keyCode === 13) {
                        $(this).blur();
                    }
                });

        },

        // convenience functions for moving stuff

        moveY: function (y) {
            this.y = y;
            this.style[C.client.transformProperty] = 'translate3d(0px,' + y + 'px,0px)';
        },

        moveX: function (x) {
            this.x = x;
            this.sliderStyle[C.client.transformProperty] = 'translate3d(' + x + 'px,0px,0px)';
        },

        moveCheck: function (x) {
            this.checkX = x;
            this.checkStyle[C.client.transformProperty] = 'translate3d(' + x + 'px,0px,0px)';
        },

        moveCross: function (x) {
            this.crossX = x;
            this.crossStyle[C.client.transformProperty] = 'translate3d(' + x + 'px,0px,0px)';
        },

        // update position based on current order

        updatePosition: function (top) {

            if (top) {
                this.el.addClass('top'); // make sure the item acted upon moves on top
            }

            this.moveY(this.data.order * C.ITEM_HEIGHT);

            if (top) {
                this.onTransitionEnd(function (t) {
                    t.el.removeClass('top');
                });
            }

        },

        onDragStart: function () {

            this.slider.addClass('drag');
            this.moveCheck(0);
            this.moveCross(0);

        },

        onDragMove: function (dx) {

            // the desired x position
            var tx = this.x + dx;

            if (this.noDragRight && tx > 0) return;
            if (this.noDragLeft && tx < 0) return;

            if (tx > 0) { // dragging to right

                if (this.noDragRight) return;
                if (tx <= rightBound) {

                    var o = tx / rightBound;
                    this.checkO = this.data.done ? 1 - o : o;
                    this.checkStyle.opacity = this.checkO;

                    if (this.checkX != 0) {
                        this.moveCheck(0);
                    }

                } else { // over bound

                    // damp the dx to a third
                    dx /= 3;

                    // move the check along with it
                    this.moveCheck(Math.max(0, (this.x + dx) - rightBound));

                    var targetO = this.data.done ? 0 : 1;
                    if (this.checkO != targetO) {
                        this.checkO = targetO;
                        this.checkStyle.opacity = targetO;
                    }

                }

            } else if (tx < 0) { // dragging to left

                if (this.noDragLeft) return;
                if (tx >= leftBound) {

                    this.crossO = tx / leftBound;
                    this.crossStyle.opacity = this.crossO;

                    if (this.crossX != 0) {
                        this.moveCross(0);
                    }

                } else { // over bound

                    dx /= 3;
                    this.moveCross(Math.min(0, (this.x + dx) - leftBound));

                    if (this.crossO != 1) {
                        this.crossO = 1;
                        this.crossStyle.opacity = 1;
                    }

                }

            }

            this.moveX(this.x + dx);

        },

        onDragEnd: function () {

            var item = this,
                doneCallback = null;

            if (item.x < leftBound) {
                // passing in a loop starter with callback to be used after confirmation
                this.del(loopWithCallback);
                return;
            } else if (item.x > rightBound) {
                doneCallback = function () {
                    item.done();
                }
            }

            loop();

            function loop () {

                if (Math.abs(item.x) > 0.1) {
                    raf(loop);
                    item.moveX(item.x * .6);
                } else {
                    item.moveX(0);
                    item.slider.removeClass('drag');
                    item.checkStyle.opacity = 0;
                    
                    if (doneCallback) doneCallback();

                }

            }

            function loopWithCallback (callback) {
                doneCallback = callback;
                loop();
            }

        },

        del: function () {

            var t = this;

            t.style[C.client.transformProperty] = 'translate3d(' + (-C.client.width - C.ITEM_HEIGHT) + 'px,' + this.y + 'px, 0)';

            t.onTransitionEnd(function (t) {

                t.deleted = true;
                t.el.remove();
                t.collection.collapseAt(t.data.order, t);

            });

        },

        onSortStart: function () {
            this.el
                .addClass('sorting-trans')
                .addClass('sorting');
        },

        onSortMove: function (dy) {

            this.moveY(this.y + dy);

            var c = this.collection,
                cy = c.y,
                ay = this.y + cy; // the actual on screen y

            if (cy < 0 && ay < upperSortMoveThreshold && dy < 3) {
                // upper move trigger is 1.5x line height
                // dy < 3 : makes sure upmove only triggers when user moves the dragged item upwards.
                // the 3px gives a small buffer for incidental downward movements
                if (!c.sortMoving) c.sortMove(1, this);
            } else if (cy > this.collection.upperBound && ay > C.client.height - lowerSortMoveThreshold && dy > -3) {
                // the lower move trigger needs to count in the extra one line of space, thus an extra item height
                if (!c.sortMoving) c.sortMove(-1, this);
            } else {
                c.sortMoving = false;
                this.checkSwap();
            }

        },

        checkSwap: function () {

            var currentAt = Math.min(this.collection.items.length - 1, ~~((this.y + C.ITEM_HEIGHT / 2) / C.ITEM_HEIGHT)),
                origin = this.data.order;

            if (currentAt != origin) {

                var targets = this.collection.getItemsBetween(origin, currentAt),
                    i = targets.length,
                    target,
                    increment = currentAt > origin ? -1 : 1;

                while (i--) {
                    target = targets[i];
                    target.data.order += increment;
                    target.updatePosition();
                }

                this.data.order = currentAt;
                
            }

        },

        onSortEnd: function () {

            this.collection.sortMoving = false;
            this.updatePosition();
            this.el.removeClass('sorting');
            this.collection.updateColor();

            this.onTransitionEnd(function (t) {
                t.el.removeClass('sorting-trans');
            });

        },

        // noRemember:
        // tells parent collection to ignore starting position and always move to 0 when edit is done.
        onEditStart: function (noRemember) {

            C.isEditing = true;

            this.title.hide();
            this.field.show().focus();
            this.el.addClass('edit');

            this.collection.onEditStart(this.data.order, noRemember);

        },

        onEditDone: function () {

            var t = this,
                val = t.field.val();

            t.collection.onEditDone(function () {

                C.isEditing = false;

                t.el.removeClass('edit');

                if (!val) {
                    t.del();
                } else {
                    t.field.hide();
                    t.title
                        .show()
                        .find('.text')
                        .text(val);
                    t.data.title = val;
                    C.db.save();
                }

            });
    
        },

        clear: function () {

            this.deleted = true;
            this.moveY(this.y + 1000);
            this.onTransitionEnd(function (t) {
                t.el.remove();
            });

        },

        onTransitionEnd: function (callback, noStrict) {

            var t = this;
            t.el.on(C.client.transitionEndEvent, function (e) {
                if (e.target !== this && !noStrict) return;
                t.el.off(C.client.transitionEndEvent);
                callback(t);
            });

        }

    };

}(C.raf));