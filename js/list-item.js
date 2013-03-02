;(function () {

    var baseH = 212,
        baseS = 93,
        baseL = 53,

        stepH = -2.5,
        stepS = 1,
        stepL = 2.5,

        maxColorSpan = 5,

        spanH = maxColorSpan * stepH,
        spanS = maxColorSpan * stepS,
        spanL = maxColorSpan * stepL;

    C.ListItem = function (data) {

        this.base = C.Item;
        this.h = baseH;
        this.s = baseS;
        this.l = baseL;
        this.todoCollection = null; // this one is lazy

        // private init jobs
        // count undone items
        this.count = 0;

        if (!data.items) data.items = [];
        
        var i = data.items.length,
            item;
        while (i--) {
            item = data.items[i];
            if (!item.done) this.count++;
        }

        if (this.count === 0) {
            this.noDragRight = true;
        }

        this.base.init.apply(this, arguments);

    };

    C.ListItem.prototype = {

        __proto__: C.Item,

        render: function () {

            this.el = $('<div class="item list-item' + (this.count ? '' : ' empty') + '">\
                    <div class="slider">\
                        <div class="inner">\
                            <span class="title"><span class="text">' + this.data.title + '</span></span>\
                            <div class="count">' + this.count + '</div>\
                            <input class="field" type="text" value="' + this.data.title + '">\
                        </div>\
                    </div>\
                </div>');

            this.countEl =this.el.find('.count');

        },

        updateColor: function () {

            var o = this.data.order,
                n = this.collection.count,
                sH = stepH,
                sS = stepS,
                sL = stepL;

            if (n > maxColorSpan) {
                sH = spanH / n;
                sS = spanS / n;
                sL = spanL / n;
            }

            this.sliderStyle.backgroundColor = 'hsl('
                + (baseH + o * sH) + ','
                + Math.min(100, (baseS + o * sS)) + '%,'
                + Math.min(100, (baseL + o * sL)) + '%)';

        },

        onTap: function (e) {

            if (e.target.className === 'text') {
                this.onEditStart();
            } else {
                this.open();
            }
            
        },

        open: function () {

            if (this.collection.inMomentum) return;
            this.el.addClass('fade');

            C.listCollection.open(this.data.order);

            if (!this.todoCollection) {
                this.todoCollection = new C.TodoCollection(this.data, this);
            }
            this.todoCollection.load(this.data.order);

            C.setCurrentCollection(this.todoCollection);

        },

        done: function () {

            if (!confirm('Are you sure you want to complete all your items in this list?')) return;
            
            var i = this.data.items.length;
            while (i--) {
                this.data.items[i].done = true;
            }
            this.count = 0;
            this.updateCount();

            C.log('Completed entire list:' + this.data.title);
            C.db.save();

        },

        del: function (loopWithCallback) {

            var t = this;

            if (t.count === 0) {
                t.base.del.apply(t);
            } else {
                if (loopWithCallback) {
                    loopWithCallback(ask);
                } else {
                    ask();
                }
            }

            function ask () {
                if (confirm('Are you sure you want to delete the entire list?')) {
                    // fix a bug in Firefox desktop here
                    // it seems after closing the confirm dialog, CSS transitions triggered within that frame (1000/60 ms)
                    // are executed as unseen and thus ends instantly
                    setTimeout(function () {
                        t.base.del.apply(t);
                    }, C.client.isWebkit ? 1 : 20);
                } else {
                    t.field.hide().val(t.title.text());
                    t.title.show();
                }
            }
        },

        updateCount: function () {

            this.countEl.text(this.count);
            if (this.count === 0) {
                this.el.addClass('empty');
                this.noDragRight = true;
            } else {
                this.el.removeClass('empty');
                this.noDragRight = false;
            }

        }

    };

}());