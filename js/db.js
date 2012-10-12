C.db = (function () {

	var supported = ('localStorage' in window) && ('JSON' in window);

	var db = {

		init: function () {

			if (supported) {
				var raw = localStorage.getItem('html5clear');
				if (raw) {
					this.data = JSON.parse(raw);
					if (!this.data) {
						this.useDefaultData();
					} else {
						 C.log('Using stored data.');
					}
				} else {
					this.useDefaultData();
				}
			} else {
				this.useDefaultData();
			}
			
		},

		save: function () {

			if (!supported) return;
			var raw = JSON.stringify(this.data);
			localStorage.setItem('html5clear', raw);

		},

		useDefaultData: function () {

			C.log('Using default data.');

			this.data = {

				state: {
					view: C.LISTS
				},

				theme: 'heatmap',

				lists: [
					{

						title: 'Hello',
						todos: [
							{
								title: 'Test'
							}
						]
					},
					{
						title: 'This is a demo',
						todos: [
							{
								title: 'Test'
							}
						]
					},
					{
						title: 'By Evan You',
						todos: [
							{
								title: 'Test'
							}
						]
					}
				]

			};

		}

	};

	return db;

}());