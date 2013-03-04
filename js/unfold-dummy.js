C.UnfoldDummy = function (options) {

    this.el = $('<div class="item unfold-dummy">\
        <div class="inner">\
            <div class="unfold top">\
                <div class="item" style="padding-left: 12px"></div>\
            </div>\
            <div class="unfold bot">\
                <div class="item" style="padding-left: 12px"></div>\
            </div>\
        </div>');

    this.style = this.el[0].style;

    this.top = this.el.find('.top');
    this.bot = this.el.find('.bot');
    this.content = this.el.find('.item');

    if (options.content) {
        this.content.text(options.content);
    }

    this.content.css('background-color', options.color);
    this.moveY((options.order - 1) * C.ITEM_HEIGHT - 1);

};

C.UnfoldDummy.prototype.moveY = C.Item.moveY;