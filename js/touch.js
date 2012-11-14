// TODO - currently broken, look for more TODOs

C.touch = (function () {

	// TouchData object constructor
	// avoiding mutating hidden class for better performance in V8
	var TouchData = function () {

		this.ox = this.oy = 0;
		this.dx = this.cx = 0;
		this.dy = this.cy = 0;
		this.dt = this.ct = this.ot = 0;
		this.tdx = this.tdy = 0;

		this.isDown = false;

		this.gesture = '';

		this.fingers = 0;

		this.itemBeingDragged = null;
		this.tapStartTime = 0;
		this.tapTarget = null;
		this.itemBeingSorted = null;
		this.moved = false;

	};

	// The data object containing info of a gesture
	var data 		= new TouchData();

	// whether it's a touch device
	var	t 			= C.client.isTouch;

	// shorthand for event types
	var	start 		= t ? 'touchstart' : 'mousedown',
		move 		= t ? 'touchmove' : 'mousemove',
		end 		= t ? 'touchend' : 'mouseup';

	var dragThreshold = 20;

	// longTap
	var longTapTimeout,
		longTapDelay = 300;

	// the public interface
	var exports = {

		init: function () {

			C.log('Touch: init');

			// prevent page dragging
			$(document.body).on('touchmove', function (e) {
				e.preventDefault();
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

			initGestures();

		},

		data: data

	};

	function initGestures () {

		C.$wrapper
			.on(start, function (e) {

				// TODO all data collection and calc should happen within these three
				// so other handlers don't need to worry about it

				e = t ? e.touches[0] : e;

				data.isDown = true;
				data.fingers++;

				data.ox = data.cx = e.pageX;
				data.oy = data.cy = e.pageY;
				data.ot = data.ct = Date.now();

				processActions('start');

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

				var now = Date.now();
				data.dt = now - data.ct;
				data.ct = now;

				processActions('move');
				
			})
			.on(end, function (e) {

				data.fingers--;

				processActions('end');

				// reset data
				if (!t || e.touches.length === 0) {
					data = exports.data = new TouchData();
				}
				
			});

	}

	var actions = {

		// TODO remove redundent logic in here

		collectionDrag: {

			move: function () {

				if (data.fingers > 1) return;
				if (data.gesture && data.gesture !== 'collectionDrag') return;

				if (Math.abs(data.tdy) > dragThreshold && data.gesture !== 'collectionDrag') {
					data.gesture = 'collectionDrag';
					C.currentCollection.onDragStart();
					return;
				}

				if (data.gesture === 'collectionDrag') {
					C.currentCollection.onDragMove(data.dy);
				}

			},

			end: function () {

				if (e.touches && e.touches.length) return;
				if (data.gesture !== 'collectionDrag') return;

				data.isDown = false;
				data.collectionDrag = false;
				var speed = data.dy / data.dt;
				C.currentCollection.onDragEnd(speed);

			}

		},

		itemDrag: {

			start: function () {

				if (!item) return;
				if (data.itemBeingDragged) return;
				if (data.fingers > 1) return;

				data.itemBeingDragged = C.currentCollection.getItemById(+item.dataset.id);

			},

			move: function () {

				if (!data.itemBeingDragged) return;
				if (data.fingers > 1) return;
				if (data.gesture && data.gesture !== 'itemDrag') return;

				if (data.gesture !== 'itemDrag' && Math.abs(data.tdx) > dragThreshold) {
					data.gesture = 'itemDrag';
					data.itemBeingDragged.onDragStart();
					return;
				}

				if (data.gesture === 'itemDrag') {
					data.itemBeingDragged.onDragMove(data.dx);
				}

			},

			end: function () {

				if (data.fingers) return;
				if (data.gesture !== 'itemDrag') return;

				data.itemBeingDragged.onDragEnd();

			}

		},

		itemTap: {

			start: function () {

				if (!item) return;
				if (data.fingers > 1) return;
				if (data.gesture) return;

				data.moved = false;
				data.tapTarget = item;
				data.tapStartTime = Date.now();

			},

			move: function () {

				data.moved = true;

			},

			end: function () {

				if (data.fingers) return;

				if (!data.moved &&
					(Date.now() - data.tapStartTime < longTapDelay) &&
					!C.currentCollection.inMomentum) {

					var target = C.currentCollection.getItemById(+data.tapTarget.dataset.id);
					target.onTap(e);
				}

			}

		},

		itemSort: {

			start: function () {

				if (!item) return;
				if (data.fingers > 1) return;
				if (data.gesture) return;

				longTapTimeout = setTimeout(longTap, longTapDelay);

			},

			move: function () {

				cancelLongTap();

				if (data.fingers > 1) return;

				if (data.gesture === 'itemSort') {
					data.itemBeingSorted.onSortMove(data.dy);
				}

			},

			end: function () {

				cancelLongTap();

				if (data.fingers) return;

				if (data.gesture === 'itemSort') {
					data.itemBeingSorted.onSortEnd();
				}
				
			}

		}

	}

	function processActions (eventType) {

		// TODO complete the logic here
		
		var item,
			actionsToProcess = [];

		switch (eventType) {

			case 'start':
				if (fingers > 1) {
					// multitouch going on!!!
				} else {
					item = getParentItem(e.target);
					if (item) {
						actionsToProcess = ['collectionDrag', 'itemTap', 'itemDrag', 'itemSort'];
					} else {
						actionsToProcess = ['collectionDrag'];
					}
				}
			break;

			case 'move':
			break;

			case 'end':
			break;

			default:
			return;
		}

		for (var i = 0, j = actionsToProcess.length; i < j; i++) {
			actions[actionsToProcess[i]][eventType]();
		}

	}

	// check if a node is within a .item element
	function getParentItem (node) {

		while (node) { // loop until we reach top of document
			if (node.className && node.className.match(/\bitem\b/)) {
				//found one!
				return node;
			}
			node = node.parentNode;
		}

		return null;

	}

	function cancelLongTap () {
		if (longTapTimeout) {
			clearTimeout(longTapTimeout);
			longTapTimeout = null;
		}
	}

	function longTap () {
		if (!data.tapTarget) return;
		if (data.fingers > 1) return;
		data.gesture = 'itemSort';
		data.itemBeingSorted = C.currentCollection.getItemById(+data.tapTarget.dataset.id);
		data.itemBeingSorted.onSortStart();
		longTapTimeout = null;
	}

	return exports;

}());