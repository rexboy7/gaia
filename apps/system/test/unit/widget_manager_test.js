'use strict';

/* global MocksHelper, MockApplications, MockhomescreenConnection,
          MockWidgetWindowHelper, MockHomescreenLauncher, MockHomescreenWindow,
          WidgetManager, WidgetFactory, CustomEvent */

mocha.globals(['BrowserConfigHelper', 'widgetFactory', 'ManifestHelper',
               'HomescreenLauncher']);

require('/shared/test/unit/mocks/mock_manifest_helper.js');
requireApp('system/test/unit/mock_applications.js');
requireApp('system/test/unit/mock_widget_window.js');
requireApp('system/test/unit/mock_homescreen_launcher.js');
requireApp('system/test/unit/mock_homescreen_window.js');
requireApp('system/test/unit/mock_homescreen_connection.js');
requireApp('system/js/browser_config_helper.js');
requireApp('system/js/widget_factory.js');
requireApp('system/js/widget_manager.js');

var mocksForWidgetManager = new MocksHelper([
  'Applications',
  'WidgetWindow',
  'ManifestHelper',
  'HomescreenLauncher',
  'homescreenConnection'
]).init();


suite('system/WidgetManager', function() {

  mocksForWidgetManager.attachTestHelpers();

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

  var mockUI;
  var widgetManager;
  var mockHomescreenWin;
  var mockWidgetFactory;
  var realWidgetFactory;

  suiteSetup(function() {
    mockUI = document.createElement('div');
    mockUI.classList.add('widget-overlay');
    document.body.appendChild(mockUI);

    realWidgetFactory = window.widgetFactory;
    mockWidgetFactory = new WidgetFactory();
    window.widgetFactory = mockWidgetFactory;
  });

  suiteTeardown(function() {
    document.body.removeChild(mockUI);
    window.widgetFactory = realWidgetFactory;
  });

  setup(function() {
    mockHomescreenWin = new MockHomescreenWindow();
    MockHomescreenLauncher.mHomescreenWindow = mockHomescreenWin;

    MockApplications.mRegisterMockApp(fakeWidgetConfig1);
    widgetManager = new WidgetManager();
    widgetManager.start();
  });

  teardown(function() {
    widgetManager.stop();
  });

  function send(type, detail) {
    window.dispatchEvent(
      new CustomEvent(type,
        {'detail': detail}));
  }

  test('add', function() {
    send('homescreen-action-object', [{
      'action': 'add',
      'requestId': 'dummy-request-id',
      'args': {
        'widgetOrigin': 'app://fakewidget1.gaiamobile.org',
        'widgetEntryPoint': '',
        'x': 10, 'y': 10, 'w': 100, 'h': 100
      }
    }]);
    assert.isNotNull(MockhomescreenConnection._result);
    assert.isTrue(MockhomescreenConnection._result.result);
    assert.equal(MockhomescreenConnection._result.requestId,
                 'dummy-request-id');
    assert.equal(MockhomescreenConnection._result.action, 'add');
    assert.equal(MockWidgetWindowHelper.mInstances.length, 1);
  });

  test('remove', function() {
    send('homescreen-action-object', [{
      'action': 'add',
      'requestId': 'dummy-request-id',
      'args': {
        'widgetOrigin': 'app://fakewidget1.gaiamobile.org',
        'widgetEntryPoint': '',
        'x': 10, 'y': 10, 'w': 100, 'h': 100
      }
    }]);

    send('widgetcreated', MockWidgetWindowHelper.mInstances[0]);
    var widgetId = MockWidgetWindowHelper.mInstances[0].instanceID;
    assert.isDefined(widgetManager.runningWidgetsById[widgetId]);

    var killSpy = this.sinon.spy(MockWidgetWindowHelper.mInstances[0], 'kill');

    send('homescreen-action-object', [{
      'action': 'remove',
      'requestId': 'dummy-request-id',
      'args': {
        'widgetId': MockWidgetWindowHelper.mInstances[0].instanceID
      }
    }]);
    assert.isTrue(killSpy.called);

    send('widgetterminated', MockWidgetWindowHelper.mInstances[0]);
    assert.isUndefined(widgetManager.runningWidgetsById[widgetId]);

    killSpy.restore();
  });

  test('update', function() {
    send('homescreen-action-object', [{
      'action': 'add',
      'requestId': 'dummy-request-id',
      'args': {
        'widgetOrigin': 'app://fakewidget1.gaiamobile.org',
        'widgetEntryPoint': '',
        'x': 10, 'y': 10, 'w': 100, 'h': 100
      }
    }]);
    send('widgetcreated', MockWidgetWindowHelper.mInstances[0]);

    var setStyleSpy = this.sinon.spy(MockWidgetWindowHelper.mInstances[0],
                                     'setStyle');

    send('homescreen-action-object', [{
      'action': 'update',
      'requestId': 'dummy-request-id',
      'args': {
        'widgetId': MockWidgetWindowHelper.mInstances[0].instanceID
      }
    }]);
    assert.isTrue(setStyleSpy.called);
    setStyleSpy.restore();
  });

  test('hideall', function() {
    send('homescreen-action-object', [{
      'action': 'add',
      'requestId': 'dummy-request-id',
      'args': {
        'widgetOrigin': 'app://fakewidget1.gaiamobile.org',
        'widgetEntryPoint': '',
        'x': 10, 'y': 10, 'w': 100, 'h': 100
      }
    }]);
    send('widgetcreated', MockWidgetWindowHelper.mInstances[0]);

    var hideSpy = this.sinon.spy(mockHomescreenWin, 'hideWidgetLayer');

    send('homescreen-action-object', [{
      'action': 'hideall',
      'requestId': 'dummy-request-id'
    }]);
    assert.isTrue(hideSpy.called);
    hideSpy.restore();
  });

  test('showall', function() {
    send('homescreen-action-object', [{
      'action': 'add',
      'requestId': 'dummy-request-id',
      'args': {
        'widgetOrigin': 'app://fakewidget1.gaiamobile.org',
        'widgetEntryPoint': '',
        'x': 10, 'y': 10, 'w': 100, 'h': 100
      }
    }]);
    send('widgetcreated', MockWidgetWindowHelper.mInstances[0]);

    var showSpy = this.sinon.spy(mockHomescreenWin, 'showWidgetLayer');

    send('homescreen-action-object', [{
      'action': 'showall',
      'requestId': 'dummy-request-id'
    }]);
    assert.isTrue(showSpy.called);
    showSpy.restore();
  });

  test('homescreenopened', function() {
    send('homescreen-action-object', [{
      'action': 'add',
      'requestId': 'dummy-request-id',
      'args': {
        'widgetOrigin': 'app://fakewidget1.gaiamobile.org',
        'widgetEntryPoint': '',
        'x': 10, 'y': 10, 'w': 100, 'h': 100
      }
    }]);
    send('widgetcreated', MockWidgetWindowHelper.mInstances[0]);

    var setVisibleSpy = this.sinon.spy(MockWidgetWindowHelper.mInstances[0],
                                       'setVisible');

    send('homescreenopened');
    assert.isTrue(setVisibleSpy.calledWith(true));
    setVisibleSpy.restore();
  });

  test('appwillopen', function() {
    send('homescreen-action-object', [{
      'action': 'add',
      'requestId': 'dummy-request-id',
      'args': {
        'widgetOrigin': 'app://fakewidget1.gaiamobile.org',
        'widgetEntryPoint': '',
        'x': 10, 'y': 10, 'w': 100, 'h': 100
      }
    }]);
    send('widgetcreated', MockWidgetWindowHelper.mInstances[0]);

    var setVisibleSpy = this.sinon.spy(MockWidgetWindowHelper.mInstances[0],
                                       'setVisible');

    send('appwillopen');
    assert.isTrue(setVisibleSpy.calledWith(false));
    setVisibleSpy.restore();
  });

});
