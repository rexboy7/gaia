'use strict';
/* global MockAppsMgmt, MockasyncStorage, MockSystemConnection, MocksHelper,
          Applications, WidgetManager */

mocha.globals(['systemConnection']);
mocha.globals(['asyncStorage']);

requireApp('homescreen-tv-arch1/test/unit/mock_system_connection.js');
requireApp('homescreen-tv-arch1/test/unit/mock_asyncStorage.js');
requireApp('homescreen-tv-arch1/test/unit/mock_apps_mgmt.js');
requireApp('homescreen-tv-arch1/js/vendor/evt.js');
requireApp('homescreen-tv-arch1/js/applications.js');
requireApp('homescreen-tv-arch1/js/widget_manager.js');

var mocksForWidgetManager = new MocksHelper([
  'AppsMgmt', 'asyncStorage', 'SystemConnection'
]).init();

var fakeAppConfig1 = {
  origin: 'app://www.fake1.org', entryPoint: '/', x: 0, y: 0, w: 0, h: 0
};

var fakeAppEntry1 = [{
  origin: fakeAppConfig1.origin,
  entry_point: fakeAppConfig1.entryPoint,
  name: 'Fake 1'
}];

var fakeAppConfig2 = {
  origin: 'app://www.fake2.org', entryPoint: '/', x: 0, y: 0, w: 0, h: 0
};

var fakeAppEntry2 = [{
  origin: fakeAppConfig2.origin,
  entry_point: fakeAppConfig2.entryPoint,
  name: 'Fake 2'
}];

var fakeAppConfig3 = {
  origin: 'app://www.fake3.org', entryPoint: '/', x: 0, y: 0, w: 0, h: 0
};

var fakeAppEntry3 = [{
  origin: fakeAppConfig3.origin,
  entry_point: fakeAppConfig3.entryPoint,
  name: 'Fake 3'
}];

var config = [
  { entryPoint: '', static: true, positionId: 0},
  { entryPoint: '', static: true, positionId: 1},
  { origin: fakeAppConfig1.origin, positionId: 2,
    entryPoint: fakeAppConfig1.entryPoint},
  { origin: fakeAppConfig2.origin, positionId: 3,
    entryPoint: fakeAppConfig2.entryPoint}
];

suite('WidgetManager', function() {
  var widgetManager;
  var realAsyncStorage;

  suiteSetup(function() {
    mocksForWidgetManager.attachTestHelpers();
    realAsyncStorage = window.asyncStorage;
    window.asyncStorage = MockasyncStorage;
    navigator.mozApps = {mgmt: MockAppsMgmt};
  });

  suiteTeardown(function() {
    window.asyncStorage = realAsyncStorage;
    realAsyncStorage = null;
  });

  suite('WidgetManager start', function() {
    setup(function() {
      widgetManager = new WidgetManager(MockSystemConnection);
    });

    teardown(function() {
      widgetManager.stop();
    });

    test('start', function() {
      this.sinon.spy(widgetManager, 'start');
      this.sinon.spy(widgetManager, 'syncWidgets');
      widgetManager.start();

      // Should invoke syncWidgets after WidgetManager started
      assert.isTrue(widgetManager.syncWidgets.called);

      widgetManager.start.restore();
      widgetManager.syncWidgets.restore();
    });

  });

  suite('WidgetManager stop', function() {
    setup(function() {
      widgetManager = new WidgetManager(MockSystemConnection);
      widgetManager.start();
    });

    teardown(function() {
      widgetManager.stop();
    });

    test('stop', function() {
      this.sinon.spy(widgetManager, 'stop');
      this.sinon.spy(widgetManager, 'handleAppRemoved');
      widgetManager.stop();
      Applications.fire('uninstall', fakeAppEntry1);

      // Should not invoke handleAppRemoved after WidgetManager stopped
      assert.isFalse(widgetManager.handleAppRemoved.called);

      widgetManager.stop.restore();
      widgetManager.handleAppRemoved.restore();
    });

  });

  suite('WidgetManager syncWidgets', function() {

    setup(function() {
      widgetManager = new WidgetManager(MockSystemConnection);
      this.sinon.spy(widgetManager, 'compareConfig');
      this.sinon.spy(widgetManager, 'dispatchMessageToIAC');
      widgetManager.start();
    });

    teardown(function() {
      widgetManager.compareConfig.restore();
      widgetManager.dispatchMessageToIAC.restore();
      widgetManager.stop();
    });

    test('Invoke syncWidgets without widget config', function() {
      // Should not if widget config does not exist
      assert.isFalse(widgetManager.compareConfig.called);
      assert.isFalse(widgetManager.dispatchMessageToIAC.called);

      // widgetManager.widgetConfig should remains undefined
      assert.equal(widgetManager.widgetConfig, undefined);
    });

    test('Invoke syncWidgets with widget config', function() {
      widgetManager.save(config);

      // Should invoke when widget config exists
      assert.isTrue(widgetManager.compareConfig.called);
      assert.isTrue(widgetManager.dispatchMessageToIAC.called);

      // widgetManager.widgetConfig should equal to predefined config
      assert.equal(widgetManager.widgetConfig, config);
    });

  });

  suite('WidgetManager compareConfig', function() {
    var oldCfg;
    var newCfg;

    setup(function() {
      widgetManager = new WidgetManager(MockSystemConnection);
      this.sinon.spy(widgetManager, 'compareConfig');
    });

    teardown(function() {
      widgetManager.compareConfig.restore();
      widgetManager.stop();
      oldCfg = [];
      newCfg = [];
    });

    test('Remove all widgets from existing config', function() {
      oldCfg = [
        { entryPoint: '', static: true, positionId: 0},
        { entryPoint: '', static: true, positionId: 1},
        { origin: fakeAppConfig1.origin, positionId: 2,
          entryPoint: fakeAppConfig1.entryPoint},
        { origin: fakeAppConfig2.origin, positionId: 3,
          entryPoint: fakeAppConfig2.entryPoint}
      ];
      var eventList = widgetManager.compareConfig(oldCfg, newCfg);
      assert.equal(eventList.length, 4);
      for (var i = 0; i < eventList.length; i++) {
        assert.equal(eventList[i].action, 'remove');
        assert.equal(eventList[i].config, oldCfg[i]);
      }
    });

    test('Add all widgets from new config', function() {
      newCfg = [
        { entryPoint: '', static: true, positionId: 0},
        { entryPoint: '', static: true, positionId: 1},
        { origin: fakeAppConfig1.origin, positionId: 2,
          entryPoint: fakeAppConfig1.entryPoint},
        { origin: fakeAppConfig2.origin, positionId: 3,
          entryPoint: fakeAppConfig2.entryPoint}
      ];
      var eventList = widgetManager.compareConfig(oldCfg, newCfg);
      assert.equal(eventList.length, 4);
      for (var i = 0; i < eventList.length; i++) {
        assert.equal(eventList[i].action, 'add');
        assert.equal(eventList[i].config, newCfg[i]);
      }
    });

    test('Add some widget to existing config', function() {
      oldCfg = [
        { entryPoint: '', static: true, positionId: 0},
        { entryPoint: '', static: true, positionId: 1}
      ];
      newCfg = [
        { entryPoint: '', static: true, positionId: 0},
        { entryPoint: '', static: true, positionId: 1},
        { origin: fakeAppConfig1.origin, positionId: 2,
          entryPoint: fakeAppConfig1.entryPoint},
        { origin: fakeAppConfig2.origin, positionId: 3,
          entryPoint: fakeAppConfig2.entryPoint}
      ];
      var eventList = widgetManager.compareConfig(oldCfg, newCfg);
      assert.equal(eventList.length, 2);
      for (var i = 0; i < eventList.length; i++) {
        assert.equal(eventList[i].action, 'add');
      }
    });

    test('Remove some widget from existing config', function() {
      oldCfg = [
        { entryPoint: '', static: true, positionId: 0},
        { entryPoint: '', static: true, positionId: 1},
        { origin: fakeAppConfig1.origin, positionId: 2,
          entryPoint: fakeAppConfig1.entryPoint},
        { origin: fakeAppConfig2.origin, positionId: 3,
          entryPoint: fakeAppConfig2.entryPoint}
      ];
      newCfg = [
        { entryPoint: '', static: true, positionId: 0},
        { entryPoint: '', static: true, positionId: 1}
      ];
      var eventList = widgetManager.compareConfig(oldCfg, newCfg);
      assert.equal(eventList.length, 2);
      for (var i = 0; i < eventList.length; i++) {
        assert.equal(eventList[i].action, 'remove');
      }
    });

    test('Change some widget in existing config', function() {
      oldCfg = [
        { entryPoint: '', static: true, positionId: 0},
        { entryPoint: '', static: true, positionId: 1},
        { origin: fakeAppConfig1.origin, positionId: 2,
          entryPoint: fakeAppConfig1.entryPoint},
        { origin: fakeAppConfig2.origin, positionId: 3,
          entryPoint: fakeAppConfig2.entryPoint}
      ];
      newCfg = [
        { entryPoint: '', static: true, positionId: 0},
        { entryPoint: '', static: true, positionId: 1},
        { origin: fakeAppConfig1.origin, positionId: 2,
          entryPoint: fakeAppConfig1.entryPoint},
        { origin: fakeAppConfig3.origin, positionId: 3,
          entryPoint: fakeAppConfig3.entryPoint}
      ];
      var eventList = widgetManager.compareConfig(oldCfg, newCfg);
      assert.equal(eventList.length, 2);
      assert.equal(eventList[0].action, 'remove');
      assert.equal(eventList[1].action, 'add');
    });

    test('Move widget position in existing config', function() {
      oldCfg = [
        { entryPoint: '', static: true, positionId: 0},
        { entryPoint: '', static: true, positionId: 1},
        { origin: fakeAppConfig1.origin, positionId: 2,
          entryPoint: fakeAppConfig1.entryPoint}
      ];
      newCfg = [
        { entryPoint: '', static: true, positionId: 0},
        { entryPoint: '', static: true, positionId: 1},
        { origin: fakeAppConfig1.origin, positionId: 3,
          entryPoint: fakeAppConfig1.entryPoint}
      ];
      var eventList = widgetManager.compareConfig(oldCfg, newCfg);
      assert.equal(eventList.length, 2);
      assert.equal(eventList[0].action, 'remove');
      assert.equal(eventList[1].action, 'add');
    });

    test('Move widget position in existing config', function() {
      oldCfg = [
        { entryPoint: '', static: true, positionId: 0},
        { entryPoint: '', static: true, positionId: 1},
        { origin: fakeAppConfig1.origin, positionId: 3,
          entryPoint: fakeAppConfig1.entryPoint}
      ];
      newCfg = [
        { entryPoint: '', static: true, positionId: 0},
        { entryPoint: '', static: true, positionId: 1},
        { origin: fakeAppConfig1.origin, positionId: 2,
          entryPoint: fakeAppConfig1.entryPoint}
      ];
      var eventList = widgetManager.compareConfig(oldCfg, newCfg);
      assert.equal(eventList.length, 2);
      assert.equal(eventList[0].action, 'add');
      assert.equal(eventList[1].action, 'remove');
    });

  });

  suite('WidgetManager dispatchMessageToIAC', function() {
    var eventList;

    var oldCfg = [
      { entryPoint: '', static: true, positionId: 0},
      { entryPoint: '', static: true, positionId: 1},
      { origin: fakeAppConfig1.origin, positionId: 2,
        entryPoint: fakeAppConfig1.entryPoint,
        x: 0, y: 0, w: 0, h: 0},
      { origin: fakeAppConfig2.origin, positionId: 3,
        entryPoint: fakeAppConfig2.entryPoint,
        x: 0, y: 0, w: 0, h: 0}
    ];
    var newCfg = [
      { entryPoint: '', static: true, positionId: 0},
      { entryPoint: '', static: true, positionId: 1},
      { origin: fakeAppConfig1.origin, positionId: 2,
        entryPoint: fakeAppConfig1.entryPoint,
        x: 0, y: 0, w: 0, h: 0},
      { origin: fakeAppConfig3.origin, positionId: 3,
        entryPoint: fakeAppConfig3.entryPoint,
        x: 0, y: 0, w: 0, h: 0}
    ];

    setup(function() {
      widgetManager = new WidgetManager(MockSystemConnection);
      this.sinon.spy(widgetManager, 'dispatchMessageToIAC');
      this.sinon.spy(widgetManager.systemConn, 'addWidget');
      this.sinon.spy(widgetManager.systemConn, 'removeWidget');
      widgetManager.save(oldCfg);
      widgetManager.start();
    });

    teardown(function() {
      widgetManager.dispatchMessageToIAC.restore();
      widgetManager.systemConn.addWidget.restore();
      widgetManager.systemConn.removeWidget.restore();
      widgetManager.stop();
      eventList = [];
    });

    test('dispatchMessageToIAC', function() {
      widgetManager.save(newCfg);
      widgetManager.compareConfig(oldCfg, config);
      assert.isTrue(widgetManager.dispatchMessageToIAC.called);
      assert.isTrue(widgetManager.systemConn.addWidget.called);
      assert.isTrue(widgetManager.systemConn.removeWidget.called);
    });

  });

  suite('WidgetManager save', function() {

    setup(function() {
      widgetManager = new WidgetManager(MockSystemConnection);
      this.sinon.spy(widgetManager, 'dispatchMessageToIAC');
      widgetManager.start();
    });

    teardown(function() {
      widgetManager.dispatchMessageToIAC.restore();
      widgetManager.stop();
    });

    test('save new config', function() {
      var newCfg = [
        { entryPoint: '', static: true, positionId: 0},
        { entryPoint: '', static: true, positionId: 1},
        { origin: fakeAppConfig1.origin, positionId: 2,
          entryPoint: fakeAppConfig1.entryPoint},
        { origin: fakeAppConfig2.origin, positionId: 3,
          entryPoint: fakeAppConfig2.entryPoint}
      ];

      widgetManager.save(newCfg);
      assert.isTrue(widgetManager.dispatchMessageToIAC.called);
      assert.equal(widgetManager.widgetConfig, newCfg);
      window.asyncStorage.getItem('widget-list', function gotConfig(config) {
        assert.equal(config, newCfg);
      });
    });

  });

  suite('WidgetManager handleAppRemoved', function() {

    setup(function() {
      widgetManager = new WidgetManager(MockSystemConnection);
      widgetManager.save(config);
      widgetManager.start();
    });

    teardown(function() {
      widgetManager.stop();
      widgetManager = null;
    });

    test('Handle app uninstall, app not in widget config', function() {
      Applications.fire('uninstall', fakeAppEntry3);
      widgetManager.widgetConfig;

      // Should have 4 entry in widget config, same as initial config
      assert.equal(widgetManager.widgetConfig.length, 4);
      assert.equal(widgetManager.widgetConfig[2].origin, fakeAppConfig1.origin);
      assert.equal(widgetManager.widgetConfig[3].origin, fakeAppConfig2.origin);
    });

    test('Handle app uninstall, app in widget config', function() {
      Applications.fire('uninstall', fakeAppEntry2);
      widgetManager.widgetConfig;

      // Should have 3 entry in widget config
      assert.equal(widgetManager.widgetConfig.length, 3);
      assert.equal(widgetManager.widgetConfig[2].origin, fakeAppConfig1.origin);
    });
  });

});
