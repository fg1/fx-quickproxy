
var { PrefsTarget } = require('sdk/preferences/event-target');
var { ToggleButton } = require('sdk/ui/button/toggle');
var sprefs = require('sdk/simple-prefs').prefs;
var gprefs = require('sdk/preferences/service');
var proxySetting = 'network.proxy.type';
var startupProxySetting = -1;

// Main button for interacting with the extension
var button = ToggleButton({
	id: 'quickproxy',
	label: 'QuickProxy',
	icon: {
		'16':  './icon-16.png',
		'32':  './icon-32.png',
		'64':  './icon-64.png',
		'128': './icon-128.png',
	},
	onChange: function() {
		this.state('window', null); // Disable state change
		toggleProxyState();
	}
});

function updateButtonState() {
	if (sprefs.proxyTypeEnabled == sprefs.proxyTypeDisabled) {
		console.log('Invalid configuration');
		button.label = 'Invalid configuration';
		button.badge = '!';
		button.state('window', {checked: false});
		return;
	} else {
		button.badge = '';
	}

	if (getProxyType() == sprefs.proxyTypeEnabled) {
		button.state('window', {checked: true});
		button.label = 'Proxy enabled';
	} else {
		button.state('window', {checked: false});
		button.label = 'Proxy disabled';
	}
}

// Register listener for changes on network.proxy.type
var target = PrefsTarget({ branchName: 'network.proxy.' });
target.on('type', function(prefName) {
	updateButtonState();
})

// General functions to access the proxy setting
function setProxyType(val) {
	console.log('network.proxy.type = ' + target.prefs['type']);
	gprefs.set(proxySetting, val);
}
function getProxyType() {
	return target.prefs['type'];
}

// Register listener for changes on simple-prefs
require('sdk/simple-prefs').on('', updateButtonState);

function toggleProxyState() {
	if (sprefs.proxyTypeEnabled == sprefs.proxyTypeDisabled) { return; }

	if (getProxyType() == sprefs.proxyTypeEnabled) {
		setProxyType(sprefs.proxyTypeDisabled);
	} else {
		setProxyType(sprefs.proxyTypeEnabled);
	}
}

// -------------------------------------

exports.main = function(options, callbacks) {
	startupProxySetting = target.prefs['type'];
	updateButtonState();
};

// Resets the proxy to the one set at startup of the browser
exports.onUnload = function(reason) {
	if (startupProxySetting == -1) { return; }
	// Prevents the callback in target.on(...)
	updateButtonState = function() {};
	setProxyType(startupProxySetting);
};
