C.UnfoldDummy = function (options) {

    this.el = $('<div class="item unfold-dummy">\
        <div class="inner">\
            <div class="unfold top">\
                <div class="item" style="padding-left: 12px"></div>
            </div>\
            <div class="unfold bot">\
                <div class="item" style="padding-left: 12px"></div>
            </div>\
        </div>\
    ')

    this.top = this.el.find('.top')
    this.bot = this.el.find('.bot')
    this.content = this.el.find('.item')

}

C.UnfoldDummy.prototype = {



}