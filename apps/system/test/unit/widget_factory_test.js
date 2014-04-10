'use strict';

/* global MocksHelper, MockApplications, WidgetFactory */

mocha.globals(['BrowserConfigHelper', 'WidgetFactory', 'ManifestHelper']);

require('/shared/test/unit/mocks/mock_manifest_helper.js');
requireApp('system/test/unit/mock_applications.js');
requireApp('system/test/unit/mock_widget_window.js');

var mocksForWidgetFactory = new MocksHelper([
  'Applications', 'WidgetWindow', 'ManifestHelper'
]).init();


suite('system/WidgetFactory', function() {

  mocksForWidgetFactory.attachTestHelpers();

  var fakeWidgetConfig1 = {
    'url': 'app://fakewidget1.gaiamobile.org/pick.html',
    'oop': true,
    'name': 'Fake Widget 1',
    'manifestURL': 'app://fakewidget1.gaiamobile.org/manifest.webapp',
    'origin': 'app://fakewidget.gaiamobile.org',
    'manifest': {
      'name': 'Fake Widget 1'
    }
  };

  var fakeWidgetRequest = {
    'widgetOrigin': 'app://fakewidget1.gaiamobile.org',
    'widgetEntryPoint': '',
    'x': 10, 'y': 10, 'w': 100, 'h': 100
  };

  var mockUI;
  var widgetFactory;

  suiteSetup(function(done) {
    mockUI = document.createElement('div');
    mockUI.classList.add('widget-overlay');
    document.body.appendChild(mockUI);
    MockApplications.mRegisterMockApp(fakeWidgetConfig1);

    requireApp('system/js/browser_config_helper.js');
    requireApp('system/js/widget_factory.js', function() {
      widgetFactory = new WidgetFactory();
      done();
    });
  });

  suiteTeardown(function() {
    document.body.removeChild(mockUI);
  });

  test('create widget', function() {
    assert.isDefined(widgetFactory.createWidget(fakeWidgetRequest));
  });
});
