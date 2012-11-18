// The module that handles all user interactions
// exposes one variable: isDown (used by C.Collection to determine when to quit animation loop)

C.touch = (function () {

	// TouchData object that represents an active touch
	var TouchData = function (e) {

		this.id = e.identifier || 'mouse';

		// starting and current x, y
		this.ox = this.cx = e.pageX;
		this.oy = this.cy = e.pageY;

		// delta x, y
		this.dx = this.dy = 0;

		// total distance x, y
		this.tdx = this.tdy = 0;

		// starting and current time
		this.ot = this.ct = Date.now();

		// delta time
		this.dt = 0;

		// target item
		var targetItemNode = getParentItem(e.target);
		if (targetItemNode) {
			this.targetItem = C.currentCollection.getItemById(+targetItemNode.dataset.id);
		}

		// whether the touch has moved
		this.moved = false;

	};

	TouchData.prototype = {

		update: function (e) {

			this.moved = true;

			this.dx = e.pageX - this.cx;
			this.cx = e.pageX;

			this.dy = e.pageY - this.cy;
			this.cy = e.pageY;

			this.tdx = this.cx - this.ox;
			this.tdy = this.cy - this.oy;

			var now = Date.now();
			this.dt = now - this.ct;
			this.ct = now;

		}

	};

	// the array that holds TouchData objects
	var touches 	= [];

	// current gesture
	var currentAction;

	// whether it's a touch device
	var	t 			= C.client.isTouch;

	// shorthand for event types
	var	start 		= t ? 'touchstart' : 'mousedown',
		move 		= t ? 'touchmove' : 'mousemove',
		end 		= t ? 'touchend' : 'mouseup';

	// threshold to trigger dragging
	var dragThreshold = 20;

	var s = 0;

	// init events
	function initEvents () {

		C.$wrapper
			.on(start, function (e) {

				// no touch events during editng.
				if (C.isEditing) return;

				// only record two fingers
				// and ignore additional fingers if already in action
				if (touches.length >= 2 || currentAction) return;

				pub.isDown = true;

				e = t ? e.changedTouches[0] : e;

				// create touch data
				var touch = new TouchData(e);
				touches.push(touch);
				
				// process actions ======================================================

				if (touches.length > 1) {
					actions.pinch.start();
				} else {
					if (touches[0].targetItem) {
						actions.itemSort.startTimeout();
					}
				}

			})
			.on(move, function (e) {

				if (C.isEditing) return;

				// for mousemove
				if (!touches.length) return;

				e = t ? e.changedTouches[0] : e;

				// update touch data
				var	i = getTouchIndex(e.identifier || 'mouse');
				if (i !== -1) {
					touches[i].update(e);
				} else {
					return; // ignore touches not in list
				}

				// process actions ======================================================

				actions.itemSort.cancelTimeout();

				if (!currentAction) {
					actions.collectionDrag.check();
					actions.itemDrag.check();
				} else {
					// passing in i to let pinch move handler know which finger is which
					actions[currentAction].move(i);
				}
				
			})
			.on(end, function (e) {

				if (C.isEditing) return;

				e = t ? e.changedTouches[0] : e;
				var id = e.identifier || 'mouse';
				var i = getTouchIndex(id);

				// ignore touches not in list
				if (i === -1) return;

				// isDown
				if (touches.length === 1) {
					pub.isDown = false;
				}

				// process actions ======================================================

				actions.itemSort.cancelTimeout();

				if (!currentAction) {
					if (touches[0].targetItem) {
						actions.itemTap.trigger(e);
					}
				} else {
					actions[currentAction].end();
					currentAction = null;
				}

				// delete afterwards.
				touches.splice(i, 1);
				
			});

	}

	var actions = {

		// TODO remove redundent logic in here

		collectionDrag: {

			check: function () {

				if (Math.abs(touches[0].tdy) > dragThreshold) {
					currentAction = 'collectionDrag';
					C.currentCollection.onDragStart();
				}

			},

			move: function () {

				C.currentCollection.onDragMove(touches[0].dy);

			},

			end: function () {

				var speed = touches[0].dy / touches[0].dt;
				C.currentCollection.onDragEnd(speed);

			}

		},

		itemDrag: {

			check: function () {

				if (touches[0].targetItem && Math.abs(touches[0].tdx) > dragThreshold) {
					currentAction = 'itemDrag';
					touches[0].targetItem.onDragStart();
				}

			},

			move: function () {

				touches[0].targetItem.onDragMove(touches[0].dx);

			},

			end: function () {

				touches[0].targetItem.onDragEnd();

			}

		},

		itemTap: {

			trigger: function (e) {

				if (!touches[0].moved &&
					!C.currentCollection.inMomentum) {

					touches[0].targetItem.onTap(e);
				}

			}

		},

		itemSort: {

			timeOut: null,

			delay: 300,

			startTimeout: function () {

				this.timeOut = setTimeout(function () {
					actions.itemSort.trigger();
				}, this.delay);

			},

			move: function () {

				touches[0].targetItem.onSortMove(touches[0].dy);

			},

			end: function () {

				this.cancelTimeout();
				touches[0].targetItem.onSortEnd();
				
			},

			trigger: function () {

				this.timeOut = null;
				if (currentAction) return;

				currentAction = 'itemSort';
				touches[0].targetItem.onSortStart();

			},

			cancelTimeout: function () {

				if (this.timeOut) {
					clearTimeout(this.timeOut);
					this.timeOut = null;
				}

			}

		},

		pinch: {

			start: function () {

				currentAction = 'pinch';

			},

			move: function (i) {

			},

			end: function () {

			}

		}

	}

	function getTouchIndex (id) {

		var i = touches.length,
			t;
		while (i--) {
			t = touches[i];
			if (t.id === id) return i;
		}

		return -1;
		
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

	// the public interface
	var pub = {

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

			initEvents();

		}

	};

	return pub;

}());