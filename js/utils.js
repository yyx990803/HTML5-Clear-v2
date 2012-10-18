C.utils = {

	// Inherit methods that don't need to be modified

	extend: function (target, source, methods) {

		var i = methods.length,
			method;

		while (i--) {
			method = methods[i];
			target[method] = source[method];
		}

	}

};