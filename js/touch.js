C.touch = (function () {

	// TouchData object constructor
	// avoiding mutating hidden class for better performance in V8
	var TouchData = function () {
		this.ox = this.oy = 0;
		this.dx = this.cx = 0;
		this.dy = this.cy = 0;
		this.dt = this.ct = 0;
		this.tdx = this.tdy = 0;
		this.isDown = false;
		this.gesture = '';
		this.fingers = 0;
	};

	var data 		= new TouchData(),
		t 			= C.client.isTouch,
		start 		= t ? 'touchstart' : 'mousedown',
		move 		= t ? 'touchmove' : 'mousemove',
		end 		= t ? 'touchend' : 'mouseup';

	var dragThreshold = 20;

	// the public interface
	var touch = {

		init: function () {

			C.log('Touch: init');

			// prevent page dragging
			$(document.body).on('touchstart touchmove touchend', function (e) {
				e.preventDefault();
			});

			initCollectionEvents();
			initItemEvents();

		},

		data: data

	};

	function initCollectionEvents () {

		C.$wrapper
			.on(start, function (e) {

				e = t ? e.touches[0] : e;

				data.isDown = true;
				data.fingers++;

				data.ox = data.cx = e.pageX;
				data.oy = data.cy = e.pageY;
				data.ct = Date.now();

			})
			.on(move, function (e) {

				if (!data.isDown) return;
				e = t ? e.touches[0] : e;

				data.dx = e.pageX - data.cx;
				data.cx = e.pageX;
				data.tdx = data.cx - data.ox;
				data.dy = e.pageY - data.cy;
				data.cy = e.pageY;
				data.tdy = data.cy - data.oy;

				// below is for collection dragging only
				if (data.gesture && data.gesture !== 'draggingCollection') return;

				var now = Date.now();
				data.dt = now - data.ct;
				data.ct = now;

				if (Math.abs(data.tdy) > dragThreshold && data.gesture !== 'draggingCollection') {
					data.gesture = 'draggingCollection';
					C.currentCollection.onDragStart();
					return;
				}

				if (data.gesture === 'draggingCollection') {
					C.currentCollection.onDragMove(data.dy);
				}
				
			})
			.on(end, function (e) {

				if (t && e.touches.length > 0) {
					data.fingers--;
					return;
				}

				if (data.gesture !== 'draggingCollection') return;

				data.isDown = false;
				data.draggingCollection = false;
				var speed = data.dy / data.dt;
				C.currentCollection.onDragEnd(speed);

				data = touch.data = new TouchData();
				
			});

		// Fix for mouseout on desktop

		if (!t) {
			C.$wrapper.on('mouseout', function (e) {

				var x = e.pageX,
					y = e.pageY,
					c = C.client;

				if (x <= c.left ||
					x >= c.right ||
					y <= c.top ||
					y >= c.bottom) {

					C.$wrapper.trigger(end);

				}

			});
		}

	}

	function initItemEvents () {

		// Horizontal drag

		var item;

		C.$wrapper
			.on(start, '.item', function (e) {

				if (item) return;
				item = C.currentCollection.getItemById(+this.dataset.id);

			})
			.on(move, function (e) {

				if (!item) return;
				if (data.gesture && data.gesture !== 'draggingItem') return;

				if (data.gesture !== 'draggingItem' && Math.abs(data.tdx) > dragThreshold) {
					data.gesture = 'draggingItem';
					item.onDragStart();
					return;
				}

				if (data.gesture === 'draggingItem') {
					item.onDragMove(data.dx);
				}

			})
			.on(end, function (e) {

				if (t && e.touches.length > 0) return;

				if (data.gesture === 'draggingItem') {
					item.onDragEnd();
					data = touch.data = {};
				}

				item = null;

			});

		// Tap, LongTap
		var tapTarget,
			moved,
			startTime,
			ltTimeout,
			ltTarget,
			ltDelay = 300;

		function cancelLongTap () {
			if (ltTimeout) {
				clearTimeout(ltTimeout);
				ltTimeout = null;
			}
		}

		function longTap () {
			if (tapTarget) {
				data.gesture = 'sorting';
				ltTarget = C.currentCollection.getItemById(+tapTarget.dataset.id);
				ltTarget.onSortStart();
				ltTimeout = null;
			}
		}

		C.$wrapper
			.on(start, '.item', function (e) {

				if (e.touches && e.touches.length > 1) return;
				if (data.gesture) return;

				moved = false;
				tapTarget = this;
				startTime = Date.now();
				ltTimeout = setTimeout(longTap, ltDelay);
			})
			.on(move, function (e) {

				moved = true;
				cancelLongTap();
				if (data.gesture === 'sorting') {
					ltTarget.onSortMove(data.dy);
				}

			})
			.on(end, function (e) {

				if (t && e.touches.length > 0) return;

				cancelLongTap();

				if (!moved &&
					(Date.now() - startTime < ltDelay) &&
					!C.currentCollection.inMomentum) {

					var target = C.currentCollection.getItemById(+tapTarget.dataset.id);
					target.onTap(e);
					tapTarget = null;
					data = touch.data = {};
				}

				if (data.gesture === 'sorting') {
					ltTarget.onSortEnd();
					ltTarget = null;
					tapTarget = null;
					data = touch.data = {};
				}
			});
	}

	return touch;

}());