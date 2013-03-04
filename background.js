chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('chrome.html',
    {width: 320, height: 496});
});