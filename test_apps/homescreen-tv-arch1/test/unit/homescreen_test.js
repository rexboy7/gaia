'use strict';
/* global MockApplications, MockAppList, MockWidgetEditor, MockSpatialNavigator,
          MocksHelper, Homescreen, KeyEvent */

require('/shared/test/unit/mocks/mock_navigator_moz_apps.js');
requireApp('homescreen-tv-arch1/test/unit/mock_applications.js');
requireApp('homescreen-tv-arch1/test/unit/mock_app_list.js');
requireApp('homescreen-tv-arch1/test/unit/mock_selection_border.js');
requireApp('homescreen-tv-arch1/test/unit/mock_overlay_manager.js');
requireApp('homescreen-tv-arch1/test/unit/mock_spatial_navigator.js');
requireApp('homescreen-tv-arch1/test/unit/mock_widget_editor.js');
requireApp('homescreen-tv-arch1/test/unit/mock_widget_manager.js');
requireApp('homescreen-tv-arch1/test/unit/mock_test_api.js');
requireApp('homescreen-tv-arch1/js/homescreen.js');

// mock classes and singletons
var mocksForHomescreen = new MocksHelper([
  'Applications',
  'AppList',
  'WidgetManager',
  'WidgetEditor',
  'OverlayManager',
  'SelectionBorder',
  'SpatialNavigator'
]).init();

suite('Homescreen', function() {
  mocksForHomescreen.attachTestHelpers();

  var mockUI;
  var homescreen;
  var appListOpenButton;
  var widgetEditorOpenButton;

  function createElementWithID(type, id, parent) {
    var ret = document.createElement(type);
    ret.id = id;
    parent.appendChild(ret);
    return ret;
  }

  function simulateKeyDown(keyCode) {
    var evt = document.createEvent('KeyboardEvent');
    evt.initKeyEvent('keydown', true, true, window,
                     0, 0, 0, 0,
                     keyCode, keyCode);
    document.body.dispatchEvent(evt);
  }

  suiteSetup(function() {
    mockUI = createElementWithID('div', 'main-section', document.body);
    mockUI.style.width = '1280px';
    mockUI.style.height = '800px';

    createElementWithID('div', 'widget-editor', mockUI);
    createElementWithID('div', 'widget-pane', mockUI);
    createElementWithID('div', 'widget-view', mockUI);
    appListOpenButton = createElementWithID('button', 'app-list-open-button',
                                            mockUI);
    widgetEditorOpenButton = createElementWithID('button', 'edit-widget',
                                                 mockUI);
    createElementWithID('button', 'widget-editor-close', mockUI);
  });

  suiteTeardown(function() {
    document.body.removeChild(mockUI);
  });

  setup(function() {
    homescreen = new Homescreen();
    homescreen.init();
  });

  teardown(function() {
    homescreen.uninit();
  });

  test('check after inited state', function() {
    assert.equal(MockApplications._inited, true);
    assert.isDefined(MockSpatialNavigator.singleton._focused);
  });

  test('open/close app list', function() {
    appListOpenButton.click();
    assert.equal(MockAppList.singleton.shown, true);
    simulateKeyDown(KeyEvent.DOM_VK_ESCAPE);
    assert.equal(MockAppList.singleton.shown, false);
  });

  test('open/close widget editor', function() {
    widgetEditorOpenButton.click();
    assert.equal(MockWidgetEditor.singleton.shown, true);
    simulateKeyDown(KeyEvent.DOM_VK_ESCAPE);
    assert.equal(MockWidgetEditor.singleton.shown, false);
  });

});
