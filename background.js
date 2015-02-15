chrome.app.runtime.onLaunched.addListener( function() {
	chrome.app.window.create( 'app.html', {
		'bounds': {
			'width': 640,
			'height': 480
		},
		minWidth: 640,
		minHeight: 480,
		maxWidth: 640,
		maxHeight: 480
	} );
} );