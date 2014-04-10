/* global MockNavigatormozApps, systemConnection */

'use strict';
require('/shared/test/unit/mocks/mock_navigator_moz_apps.js');
requireApp('homescreen-tv-arch1/js/system_connection.js');
requireApp('homescreen-tv-arch1/test/unit/mock_uuid.js');

suite('SystemConntection', function() {
  var app;

  suiteSetup(function() {
    window.navigator.mozApps = MockNavigatormozApps;
    app = {
      name: 'homescreen',
      launch: MockNavigatormozApps._mLaunch.bind(MockNavigatormozApps),
      connect: function(keyword) {
        MockNavigatormozApps.mLastConnectionKeyword = keyword;
        return {
          then: function(cb) {
            MockNavigatormozApps.mLastConnectionCallback = cb;
          }
        };
      }
    };
  });

  suiteTeardown(function() {
    MockNavigatormozApps.mTeardown();
  });

  setup(function() {
  });

  teardown(function() {
    systemConnection._wrappedUnrespondRequests = [];
  });

  test('addWidget', function() {
    var args = {
      x: 220,
      y: 10,
      w: 200,
      h: 150,
      widgetOrigin: 'app://widget.gaiamobile.org/',
      widgetEntryPoint: 'entry'
    };
    assert.strictEqual(systemConnection._wrappedUnrespondRequests.length, 0);
    systemConnection.addWidget(args);
    MockNavigatormozApps.mTriggerLastRequestSuccess(app);
    if (MockNavigatormozApps.mLastConnectionCallback) {
      MockNavigatormozApps.mLastConnectionCallback([]);
    }
    assert.isTrue(systemConnection._wrappedUnrespondRequests.length > 0);
    assert.deepEqual(
      systemConnection._wrappedUnrespondRequests[0].requestObject.args, args);
    assert.strictEqual(
      systemConnection._wrappedUnrespondRequests[0].requestObject.action,
      'add');
  });

  test('showAll', function() {
    assert.isTrue(systemConnection._wrappedUnrespondRequests.length === 0);
    systemConnection.showAll();
    MockNavigatormozApps.mTriggerLastRequestSuccess(app);
    if (MockNavigatormozApps.mLastConnectionCallback) {
      MockNavigatormozApps.mLastConnectionCallback([]);
    }
    assert.isTrue(systemConnection._wrappedUnrespondRequests.length > 0);
    assert.isUndefined(
      systemConnection._wrappedUnrespondRequests[0].requestObject.args);
    assert.strictEqual(
      systemConnection._wrappedUnrespondRequests[0].requestObject.action,
      'showall');
  });

});
