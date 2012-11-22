C.client = (function () {

    var client = {

        isTouch: ('ontouchstart' in window),

        init: function () {

            C.log('Client: init');

            if (!this.isTouch) {

                this.width = 320;
                this.height = 548;
                $(document.body).addClass('desktop');

            }

            this.update();
            $(window).resize(function () {
                C.client.update();
            });

            // compatibility
            // only supports browsers with CSS 3D Transforms
            // Chrome, FF, IE10+

            var s = document.body.style;

            C.client.isWebkit = 'webkitTransform' in s;
            
            C.client.transformProperty =
                'webkitTransform' in s ? 'webkitTransform' :
                'mozTransform' in s ? 'mozTransform' :
                'msTransform' in s ? 'msTransform' : 'transform';

            var t = C.client.transformProperty;
            C.client.transitionEndEvent =
                t === 'webkitTransform' ? 'webkitTransitionEnd' : 'transitionend';

        },

        update: function () {

            if (this.isTouch) {

                this.width = window.innerWidth,
                this.height = window.innerHeight;
                if (C.currentView) {
                    C.currentView.updateBounds();
                    C.currentView.onDragEnd(0);
                }

            } else {

                var wrapper = C.$wrapper[0];
                this.top = wrapper.offsetTop;
                this.left = wrapper.offsetLeft;
                this.right = this.left + this.width;
                this.bottom = this.top + this.height;

            }

        }

    };

    return client;

}());