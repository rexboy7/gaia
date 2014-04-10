'use strict';

/* global WidgetWindow, MocksHelper */

mocha.globals(['SettingsListener', 'OrientationManager', 'System',
               'BrowserConfigHelper', 'BrowserFrame', 'AppWindow',
               'BrowserMixin', 'WidgetWindow']);

requireApp('system/shared/test/unit/mocks/mock_settings_listener.js');
requireApp('system/test/unit/mock_orientation_manager.js');

var mocksForWidgetWindow = new MocksHelper([
  'SettingsListener',
  'OrientationManager'
]).init();

suite('system/WidgetWindow', function() {

  mocksForWidgetWindow.attachTestHelpers();

  var dummyContainer;
  var widgetWindow;
  var fakeAppConfig1 = {
    url: 'app://www.fake/index.html',
    manifest: {},
    manifestURL: 'app://wwww.fake/ManifestURL',
    origin: 'app://www.fake'
  };

  suiteSetup(function(done) {
    dummyContainer = document.createElement('div');
    document.body.appendChild(dummyContainer);
    requireApp('system/js/system.js');
    requireApp('system/js/browser_config_helper.js');
    requireApp('system/js/browser_frame.js');
    requireApp('system/js/app_window.js');
    requireApp('system/js/browser_mixin.js');
    requireApp('system/js/widget_window.js', done);
  });

  suiteTeardown(function() {
    document.body.removeChild(dummyContainer);
  });

  setup(function() {
    widgetWindow = new WidgetWindow(fakeAppConfig1, dummyContainer);
  });

  test('check properties', function() {
    assert.equal(widgetWindow.containerElement, dummyContainer);
    assert.notEqual(dummyContainer.innerHTML, '');
  });

  test('setStyle', function() {
    widgetWindow.setStyle({ 'x': 100, 'y': 100,
                            'w': 500, 'h': 500 });
    assert.equal(widgetWindow.element.style.top, '100px');
    assert.equal(widgetWindow.element.style.left, '100px');
    assert.equal(widgetWindow.element.style.width, '500px');
    assert.equal(widgetWindow.element.style.height, '500px');
  });
});
