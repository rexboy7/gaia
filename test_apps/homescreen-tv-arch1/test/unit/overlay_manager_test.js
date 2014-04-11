'use strict';
/* global MockSystemConnection, OverlayManager */

mocha.globals(['systemConnection']);

requireApp('homescreen-tv-arch1/test/unit/mock_system_connection.js');
requireApp('homescreen-tv-arch1/js/overlay_manager.js');

suite('OverlayManager', function() {

  var realSystemConn;
  suiteSetup(function() {
    realSystemConn = window.systemConnection;
    window.systemConnection = MockSystemConnection;
  });

  suiteTeardown(function() {
    window.systemConnection = realSystemConn;
  });

  setup(function() {
    OverlayManager.reset();
  });

  function invokeSystemConnCallback(type) {
    var calledCount = 0;
    // We need to invoke callback of hideAll.
    for (var uuid in MockSystemConnection.callbacks[type]) {
      MockSystemConnection.callbacks[type][uuid]();
      calledCount++;
    }
    MockSystemConnection.callbacks[type] = {};
    return calledCount;
  }

  test('open widget editor', function(done) {
    var callbackCalled = false;
    OverlayManager.readyToOpen('widget-editor', function() {
      callbackCalled = true;
    });
    assert.equal(OverlayManager._widgetState, 'hiding');

    var calledCount = invokeSystemConnCallback('hideAll');
    assert.equal(OverlayManager._widgetState, 'hidden');

    setTimeout(function() {
      assert.isTrue(callbackCalled);
      assert.equal(calledCount, 1);
      done();
    }, 5);
  });

  test('open app list', function(done) {
    var callbackCalled = false;
    OverlayManager.readyToOpen('app-list', function() {
      callbackCalled = true;
    });
    assert.equal(OverlayManager._widgetState, 'hiding');

    var calledCount = invokeSystemConnCallback('hideAll');
    assert.equal(OverlayManager._widgetState, 'hidden');

    setTimeout(function() {
      assert.isTrue(callbackCalled);
      assert.equal(calledCount, 1);
      done();
    }, 5);
  });

  test('open widget-editor > app list', function(done) {
    var widgetEditorCalled = false;
    OverlayManager.readyToOpen('widget-editor', function() {
      widgetEditorCalled = true;
    });
    assert.equal(OverlayManager._widgetState, 'hiding');

    var calledCount = invokeSystemConnCallback('hideAll');
    assert.equal(OverlayManager._widgetState, 'hidden');

    // once widgets are hidden, the callback is called at next timeout tick.
    var appListCalled = false;
    OverlayManager.readyToOpen('app-list', function() {
      appListCalled = true;
    });
    assert.equal(OverlayManager._widgetState, 'hidden');

    setTimeout(function() {
      assert.equal(calledCount, 1);
      assert.isTrue(widgetEditorCalled);
      assert.isTrue(appListCalled);
      done();
    }, 5);
  });

  test('open widget-editor > close widget-editor', function(done) {
    var widgetEditorCalled = false;
    OverlayManager.readyToOpen('widget-editor', function() {
      widgetEditorCalled = true;
    });
    assert.equal(OverlayManager._widgetState, 'hiding');

    var hideAllCalledCount = invokeSystemConnCallback('hideAll');
    assert.equal(OverlayManager._widgetState, 'hidden');

    OverlayManager.afterClosed('widget-editor');
    assert.equal(OverlayManager._widgetState, 'showing');

    var showAllCalledCount = invokeSystemConnCallback('showAll');
    assert.equal(OverlayManager._widgetState, 'shown');

    setTimeout(function() {
      assert.equal(hideAllCalledCount, 1);
      assert.isTrue(widgetEditorCalled);
      assert.equal(showAllCalledCount, 1);
      done();
    }, 5);
  });

  test('open widget-editor > open widget-editor > close it', function(done) {
    var firstCalled = false;
    OverlayManager.readyToOpen('widget-editor', function() {
      firstCalled = true;
    });
    assert.equal(OverlayManager._widgetState, 'hiding');

    var calledCountFrist = invokeSystemConnCallback('hideAll');
    assert.equal(OverlayManager._widgetState, 'hidden');

    // open widget second-time
    var secondCalled = false;
    OverlayManager.readyToOpen('widget-editor', function() {
      secondCalled = true;
    });
    assert.equal(OverlayManager._widgetState, 'hidden');
    var calledCountSecond = invokeSystemConnCallback('hideAll');

    OverlayManager.afterClosed('widget-editor');
    assert.equal(OverlayManager._widgetState, 'showing');

    var showAllCalledCount = invokeSystemConnCallback('showAll');
    assert.equal(OverlayManager._widgetState, 'shown');

    setTimeout(function() {
      assert.isTrue(firstCalled);
      assert.equal(calledCountFrist, 1);
      assert.isTrue(secondCalled);
      assert.equal(calledCountSecond, 0);
      assert.equal(showAllCalledCount, 1);
      done();
    }, 5);
  });
});
