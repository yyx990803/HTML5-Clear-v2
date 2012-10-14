C.touch = (function () {

	var data 		= {},
		t 			= C.client.isTouch,
		start 		= t ? 'touchstart' : 'mousedown',
		move 		= t ? 'touchmove' : 'mousemove',
		end 		= t ? 'touchend' : 'mouseup';

	var dragThreshold = 20;

	var touch = {

		init: function () {

			C.log('Touch: init');

			// prevent page dragging
			$(document.body).on('touchstart touchmove touchend', function (e) {
				e.preventDefault();
			});

			initListDrag();
			initItemDrag();

		},

		data: data

	};

	function initListDrag () {

		C.$wrapper
			.on(start, function (e) {

				e = t ? e.touches[0] : e;

				data.isDown = true;
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

				if (data.draggingItem) return;

				var now = Date.now();
				data.dt = now - data.ct;
				data.ct = now;

				if (!data.dragging && Math.abs(data.tdy) > dragThreshold) {
					data.dragging = true;
					C.currentView.onDragStart();
					return;
				}

				if (data.dragging) {
					C.currentView.onDragMove(data.dy);
				}
				
			})
			.on(end, function (e) {

				if (t && e.touches.length) return;
				if (data.draggingItem) return;

				if (data.dragging) {
					data.dragging = false;
					C.currentView.onDragEnd(data);
				}

				data = touch.data = {};
				
			});

	}

	function initItemDrag () {

		var item;

		C.$wrapper
			.on(start, '.item', function (e) {

				if (item) return;
				item = C.currentView.items[this.dataset.id];

			})
			.on(move, function (e) {

				if (data.dragging || !item) return;

				if (!data.draggingItem && Math.abs(data.tdx) > dragThreshold) {
					data.draggingItem = true;
					item.onDragStart();
					return;
				}

				if (data.draggingItem) {
					item.onDragMove(data.dx);
				}

			})
			.on(end, function (e) {

				if (t && e.touches.length > 0) return;
				if (data.draggingItem) {
					item.onDragEnd();
					data = touch.data = {};
				}
				
				item = null;

			});

	}

	return touch;

}());