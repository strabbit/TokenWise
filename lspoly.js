// So Dexie tries to use local storage, which Chrome apps disable.
// I'm not sure why, but it doesn't seem necessary...
// Lazy polyfill to stop errors :)
window._localStorePolyfill = {};

window.localStorage = {
	getItem: function( key ) {
		return window._localStorePolyfill[ key ];
	},
	setItem: function( key, val ) {
		window._localStorePolyfill[ key ] = val;
	}
}