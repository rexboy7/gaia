'use strict';
/* global MockApplications, MockAppList, MockOverlayManager,
          MockSpacialNavigator, MockSelectionBorder, MockLayoutEditor,
          URL, WidgetEditor*/

mocha.globals(['WidgetEditor']);

requireApp('homescreen-tv-arch1/js/vendor/evt.js');
requireApp('homescreen-tv-arch1/test/unit/mock_applications.js');
requireApp('homescreen-tv-arch1/test/unit/mock_app_list.js');
requireApp('homescreen-tv-arch1/test/unit/mock_overlay_manager.js');
requireApp('homescreen-tv-arch1/test/unit/mock_spatial_navigator.js');
requireApp('homescreen-tv-arch1/test/unit/mock_selection_border.js');
requireApp('homescreen-tv-arch1/test/unit/mock_layout_editor.js');

var options = {};

var mocksForWidgetEditor = new MocksHelper([
  'Applications', 'AppList', 'OverlayManager', 'LayoutEditor',
  'SelectionBorder', 'SpatialNavigator'
]).init();

suite('WidgetEditor', function() {
  mocksForWidgetEditor.attachTestHelpers();
  var widgetEditor;
  var appList;
  var apps;

  suiteSetup(function(done) {
    appList = new MockAppList();
    apps = [{
      name: 'name', iconUrl: 'iconUrl',
      origin: 'origin', entry_point: 'entry_point'
    }];
    var widgetEditorDiv = document.createElement('div');
    var widgetContainerDiv = document.createElement('div');
    widgetEditorDiv.hidden = true;
    options = {
      dom: widgetEditorDiv,
      container: widgetContainerDiv,
      appList: appList,
      offset: {top: 50, left: 0},
      targetSize: {w: 1280, h: 800}
    };
    requireApp('homescreen-tv-arch1/js/widget_editor.js', done);
  });

  suiteTeardown(function() {
    appList = null;
    options = {};
  });

  suite('WidgetEditor start', function() {
    setup(function() {
      widgetEditor = new WidgetEditor(options);
      this.sinon.stub(widgetEditor, 'handleAppRemoved', function() {});
      this.sinon.stub(widgetEditor, 'handleAppUpdated', function() {});
      this.sinon.stub(widgetEditor, 'handlePlaceClicked', function() {});
      widgetEditor.start();
    });

    teardown(function() {
      widgetEditor.handleAppRemoved.restore();
      widgetEditor.handleAppUpdated.restore();
      widgetEditor.handlePlaceClicked.restore();
      widgetEditor.stop();
    });

    test('Should have place holders initialized', function() {
      var editor = new LayoutEditor();
      editor.init(options.container, options.targetSize, options.offset);
      // Should invoke layout editor and have same place holders
      assert.equal(widgetEditor.editor.placeHolders.length,
        editor.placeHolders.length);
    });

    test('Should respond to uninstall/update events', function() {
      Applications.trigger('uninstall');
      Applications.trigger('update');
      assert.isTrue(widgetEditor.handleAppRemoved.called);
      assert.isTrue(widgetEditor.handleAppUpdated.called);
    });

    test('Should respond to container click events', function() {
      widgetEditor.container.click();
      assert.isTrue(widgetEditor.handlePlaceClicked.called);
    });
  });

  suite('WidgetEditor stop', function() {
    setup(function() {
      widgetEditor = new WidgetEditor(options);
      this.sinon.spy(widgetEditor, 'switchFocus');
      this.sinon.spy(widgetEditor, 'handlePlaceClicked');
      this.sinon.stub(widgetEditor, 'handleAppRemoved', function() {});
      this.sinon.stub(widgetEditor, 'handleAppUpdated', function() {});
      widgetEditor.start();
      widgetEditor.stop();
    });

    teardown(function() {
      widgetEditor.switchFocus.restore();
      widgetEditor.handleAppRemoved.restore();
      widgetEditor.handleAppUpdated.restore();
    });

    test('Should not respond to focus event', function() {
      widgetEditor.spatialNav.focus();
      assert.isFalse(widgetEditor.switchFocus.called);
    });

    test('Should not respond to click event', function() {
      widgetEditor.container.click();
      assert.isFalse(widgetEditor.handlePlaceClicked.called);
    });

    test('Should not respond to uninstall/update events', function() {
      Applications.trigger('uninstall');
      Applications.trigger('update');
      assert.isFalse(widgetEditor.handleAppRemoved.called);
      assert.isFalse(widgetEditor.handleAppUpdated.called);
    });
  });

  suite('WidgetEditor show', function() {
    setup(function() {
      widgetEditor = new WidgetEditor(options);
      widgetEditor.start();
      this.sinon.spy(widgetEditor.spatialNav, 'focus');
      this.sinon.spy(widgetEditor, 'fire');
    });

    teardown(function() {
      widgetEditor.spatialNav.focus.restore();
      widgetEditor.fire.restore();
      widgetEditor.stop();
    });

    test('Should show widget editor if not shown', function() {
      widgetEditor.show();
      assert.isFalse(widgetEditor.dom.hidden);
      assert.isTrue(widgetEditor.spatialNav.focus.called);
      assert.equal(widgetEditor.fire.args[0][0], 'shown');
    });

    test('Should not change widget editor if already shown', function() {
      widgetEditor.show();
      widgetEditor.show();
      assert.isFalse(widgetEditor.dom.hidden);
      assert.isFalse(widgetEditor.spatialNav.focus.called);
    });
  });

  suite('WidgetEditor hide', function() {
    setup(function() {
      widgetEditor = new WidgetEditor(options);
      widgetEditor.start();
      this.sinon.spy(widgetEditor, 'fire');
    });

    teardown(function() {
      widgetEditor.fire.restore();
      widgetEditor.stop();
    });

    test('Should hide widget editor if not hidden', function() {
      widgetEditor.hide();
      // Should fire closed event
      assert.isTrue(widgetEditor.dom.hidden);
      assert.equal(widgetEditor.fire.args[0][0], 'closed');
    });

    test('Should not change widget editor if already hidden', function() {
      widgetEditor.hide();
      widgetEditor.hide();
      // Should not fire closed event
      assert.isTrue(widgetEditor.dom.hidden);
      assert.isFalse(widgetEditor.fire.called);
    });
  });

  suite('WidgetEditor isShown', function() {
    setup(function() {
      widgetEditor = new WidgetEditor(options);
      widgetEditor.start();
    });

    teardown(function() {
      widgetEditor.stop();
    });

    test('Should have widget editor visibility state', function() {
      var isShown = widgetEditor.isShown();
      assert.equal(!widgetEditor.dom.hidden, isShown);
    });
  });

  suite('WidgetEditor exportConfig', function() {
    setup(function() {
      widgetEditor = new WidgetEditor(options);
      widgetEditor.start();
      this.sinon.spy(widgetEditor.editor, 'exportConfig');
    });

    teardown(function() {
      widgetEditor.editor.exportConfig.restore();
      widgetEditor.stop();
    });

    test('Should have layout editor config', function() {
      widgetEditor.exportConfig();
      assert.isTrue(widgetEditor.editor.exportConfig.called);
    });
  });

  suite('WidgetEditor importConfig', function() {
    setup(function() {
      widgetEditor = new WidgetEditor(options);
      widgetEditor.start();
      this.sinon.spy(widgetEditor.editor, 'reset');
      this.sinon.spy(widgetEditor, 'fillAppInfo');
    });

    teardown(function() {
      widgetEditor.editor.reset.restore();
      widgetEditor.fillAppInfo.restore();
      widgetEditor.stop();
    });

    test('Should invoke importConfig if config exist', function() {
      var config = [{}, {}];
      widgetEditor.importConfig(config);
      assert.isTrue(widgetEditor.editor.reset.called);
      assert.isTrue(widgetEditor.fillAppInfo.called);
    });

    test('Should not invoke importConfig if config not exist', function() {
      widgetEditor.importConfig();
      assert.isFalse(widgetEditor.editor.reset.called);
      assert.isFalse(widgetEditor.fillAppInfo.called);
    });
  });

  suite('WidgetEditor fillAppInfo', function() {
    setup(function() {
      widgetEditor = new WidgetEditor(options);
      widgetEditor.start();
    });

    teardown(function() {
      widgetEditor.stop();
    });

    test('Should invoke Applications getIconBlob and callback', function() {
      var cfg = {origin: '', entryPoint: '', name: ''};
      this.sinon.spy(Applications, 'getIconBlob');
      this.sinon.spy(Applications, 'launch');
      widgetEditor.fillAppInfo(cfg, Applications.launch);

      assert.isTrue(Applications.getIconBlob.called);
      assert.isTrue(Applications.launch.called);
    });
  });

  suite('WidgetEditor handleKeyDown', function() {
    setup(function() {
      widgetEditor = new WidgetEditor(options);
      widgetEditor.start();
      this.sinon.spy(widgetEditor.spatialNav, 'move');
      this.sinon.stub(widgetEditor, 'togglePlace', function() {});
    });

    teardown(function() {
      widgetEditor.spatialNav.move.restore();
      widgetEditor.togglePlace.restore();
      widgetEditor.stop();
    });

    test('Handle up/down/left/right with widget editor shown', function() {
      widgetEditor.show();
      widgetEditor.handleKeyDown('Up');
      assert.equal(widgetEditor.spatialNav.move.callCount, 1);
      widgetEditor.handleKeyDown('Down');
      assert.equal(widgetEditor.spatialNav.move.callCount, 2);
      widgetEditor.handleKeyDown('Left');
      assert.equal(widgetEditor.spatialNav.move.callCount, 3);
      widgetEditor.handleKeyDown('Right');
      assert.equal(widgetEditor.spatialNav.move.callCount, 4);
    });

    test('Handle enter with widget editor shown', function() {
      widgetEditor.show();
      widgetEditor.handleKeyDown('Enter');
      assert.isTrue(widgetEditor.togglePlace.called);
    });

    test('Handle other key with widget editor shown', function() {
      widgetEditor.show();
      widgetEditor.handleKeyDown('A');
      assert.isFalse(widgetEditor.spatialNav.move.called);
      assert.isFalse(widgetEditor.togglePlace.called);
    });

    test('Should not respond when widget editor is hidden', function() {
      widgetEditor.hide();
      widgetEditor.handleKeyDown('Up');
      widgetEditor.handleKeyDown('Down');
      widgetEditor.handleKeyDown('Left');
      widgetEditor.handleKeyDown('Right');
      widgetEditor.handleKeyDown('Enter');
      widgetEditor.handleKeyDown('A');
      assert.isFalse(widgetEditor.spatialNav.move.called);
      assert.isFalse(widgetEditor.togglePlace.called);
    });
  });

  suite('WidgetEditor togglePlace', function() {
    setup(function() {
      widgetEditor = new WidgetEditor(options);
      widgetEditor.start();
      this.sinon.spy(widgetEditor, 'revokeUrl');
      this.sinon.stub(widgetEditor.editor, 'removeWidget');
      this.sinon.spy(widgetEditor.appList, 'show');
    });

    teardown(function() {
      widgetEditor.stop();
    });

    test('toggle on empty place', function() {
      var places = widgetEditor.editor.placeHolders;
      widgetEditor.spatialNav.focus(places[2]);
      widgetEditor.togglePlace(places[2]);
      // Empty place, show appList
      assert.isFalse(widgetEditor.revokeUrl.called);
      assert.isFalse(widgetEditor.editor.removeWidget.called);
      assert.isTrue(widgetEditor.appList.show.called);
    });

    test('toggle on widget place', function() {
      var places = widgetEditor.editor.placeHolders;
      places[2].app = {origin: '', entryPoint: ''};
      widgetEditor.spatialNav.focus(places[2]);
      widgetEditor.togglePlace(places[2]);
      // Widget place, revokeUrl and removeWidget
      assert.isTrue(widgetEditor.revokeUrl.called);
      assert.isTrue(widgetEditor.editor.removeWidget.called);
      assert.isFalse(widgetEditor.appList.show.called);
    });
  });

  suite('WidgetEditor switchFocus', function() {
    setup(function() {
      widgetEditor = new WidgetEditor(options);
      widgetEditor.start();
      this.sinon.spy(widgetEditor.selectionBorder, 'select');
    });

    teardown(function() {
      widgetEditor.selectionBorder.select.restore();
      widgetEditor.stop();
    });

    test('Should not invoke switchFocus without place holder', function() {
      widgetEditor.switchFocus();
      assert.isFalse(widgetEditor.selectionBorder.select.called);
    });

    test('Should invoke switchFocus with place holder', function() {
      var place = widgetEditor.editor.placeHolders[0];
      widgetEditor.switchFocus(place);
      assert.isTrue(widgetEditor.selectionBorder.select.called);
    });
  });

  suite('WidgetEditor handleAppChosen', function() {
    var app;

    setup(function() {
      widgetEditor = new WidgetEditor(options);
      widgetEditor.start();
      this.sinon.spy(widgetEditor.spatialNav, 'currentFocus');
      this.sinon.spy(widgetEditor.appList, 'hide');
      this.sinon.spy(widgetEditor.editor, 'addWidget');
      this.sinon.spy(Applications, 'getIconBlob');
      app = apps[0];
    });

    teardown(function() {
      widgetEditor.spatialNav.currentFocus.restore();
      widgetEditor.appList.hide.restore();
      widgetEditor.editor.addWidget.restore();
      Applications.getIconBlob.restore();
      widgetEditor.stop();
    });

    test('handleAppChosen', function() {
      widgetEditor.handleAppChosen(app);
      assert.isTrue(widgetEditor.editor.addWidget.called);
      var args = widgetEditor.editor.addWidget.args[0][0];
      assert.equal(args.name, app.name);
      assert.equal(args.origin, app.origin);
      assert.equal(args.entryPoint, app.entry_point);
      assert.isTrue(widgetEditor.spatialNav.currentFocus.called);
      assert.isTrue(Applications.getIconBlob.called);
      assert.equal(Applications.getIconBlob.args[0][0], app.origin);
      assert.equal(Applications.getIconBlob.args[0][1], app.entry_point);
      assert.isTrue(widgetEditor.appList.hide.called);
    });
  });

  suite('WidgetEditor handleAppRemoved', function() {
    setup(function() {
      widgetEditor = new WidgetEditor(options);
      widgetEditor.start();
      this.sinon.stub(widgetEditor.editor, 'removeWidgets', function() {});
    });

    teardown(function() {
      widgetEditor.editor.removeWidgets.restore();
      widgetEditor.stop();
    });

    test('handleAppRemoved', function() {
      widgetEditor.handleAppRemoved(apps);
      assert.isTrue(widgetEditor.editor.removeWidgets.called);
    });
  });

  suite('WidgetEditor handleAppUpdated', function() {
    setup(function() {
      widgetEditor = new WidgetEditor(options);
      widgetEditor.start();
      this.sinon.stub(widgetEditor.editor, 'updateWidgets', function() {});
    });

    teardown(function() {
      widgetEditor.editor.updateWidgets.restore();
      widgetEditor.stop();
    });

    test('handleAppRemoved', function() {
      widgetEditor.handleAppUpdated(apps);
      assert.isTrue(widgetEditor.editor.updateWidgets.called);
    });
  });

  suite('WidgetEditor handlePlaceClicked', function() {
    var e;
    var places;

    setup(function() {
      widgetEditor = new WidgetEditor(options);
      widgetEditor.start();
      this.sinon.stub(widgetEditor, 'togglePlace', function() {});
      this.sinon.stub(widgetEditor.spatialNav, 'focus', function() {});
      places = widgetEditor.editor.placeHolders;
      e = {
        stopImmediatePropagation: function() {},
        preventDefault: function() {}
      };
    });

    teardown(function() {
      widgetEditor.togglePlace.restore();
      widgetEditor.spatialNav.focus.restore();
      widgetEditor.stop();
    });

    test('Click element not in placeholder', function() {
      e.target = {};
      widgetEditor.handlePlaceClicked(e);
      assert.isFalse(widgetEditor.togglePlace.called);
      assert.isFalse(widgetEditor.spatialNav.focus.called);
    });

    test('Click static element in placeholder', function() {
      // click on static element: place 1, 2
      for(var i = 0; i < 2; i++) {
        e.target = places[i].elm;
        widgetEditor.handlePlaceClicked(e);
        assert.equal(widgetEditor.togglePlace.callCount, 0);
        assert.equal(widgetEditor.spatialNav.focus.callCount, 0);
      }
    });

    test('Click non static element in placeholder', function() {
      // click non static element: place 3, 4, 5, 6
      for(var i = 0; i < 4; i++) {
        var idx = i + 2;
        var callCount = i + 1;
        e.target = places[idx].elm;
        widgetEditor.handlePlaceClicked(e);
        assert.equal(widgetEditor.togglePlace.callCount, callCount);
        assert.equal(widgetEditor.spatialNav.focus.callCount, callCount);
      }
    });
  });
});
