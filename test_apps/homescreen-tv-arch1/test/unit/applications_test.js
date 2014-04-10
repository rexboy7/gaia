'use strict';
/* global Applications, MockNavigatormozApps, MockAppsMgmt, MockApp */

require('/shared/test/unit/mocks/mock_navigator_moz_apps.js');
requireApp('homescreen-tv-arch1/test/unit/mock_app.js');
requireApp('homescreen-tv-arch1/test/unit/mock_apps_mgmt.js');
requireApp('homescreen-tv-arch1/js/vendor/evt.js');
requireApp('homescreen-tv-arch1/js/applications.js');

suite('Applications', function() {
  var realMozApps;
  var origAppsMgmt;

  /**
   * apps list:
   *   1. fake system app
   *   2. fake homescreen app
   *   3. fake input app
   *   4. fake normal app
   *   5. fake combo app with 2 entry points
   *   6. fake combo certified app with 2 entry points
   */
  var fakeApp1;
  var fakeApp2;
  var fakeApp3;
  var fakeApp4;
  var fakeApp5;
  var fakeApp6;

  function createMockApps() {
    fakeApp1 = new MockApp({
      'origin': 'https://test-app1.gaiamobile.org',
      'manifestURL': 'https://test-app1.gaiamobile.org/manifest.webapp',
      'manifest': {
        'launch_path': '/index.html',
        'name': 'test-app1',
        'role': 'system',
        'icons': {
          '32': '/fake-icon-32.jpg',
          '64': '/fake-icon-64.jpg',
          '128': '/fake-icon-128.jpg'
        }
      }
    });
    fakeApp2 = new MockApp({
      'origin': 'https://test-app2.gaiamobile.org',
      'manifestURL': 'https://test-app2.gaiamobile.org/manifest.webapp',
      'manifest': {
        'launch_path': '/index.html',
        'name': 'test-app2',
        'role': 'homescreen',
        'icons': {
          '32': '/fake-icon-32.jpg',
          '64': '/fake-icon-64.jpg',
          '128': '/fake-icon-128.jpg'
        }
      }
    });
    fakeApp3 = new MockApp({
      'origin': 'https://test-app3.gaiamobile.org',
      'manifestURL': 'https://test-app3.gaiamobile.org/manifest.webapp',
      'manifest': {
        'launch_path': '/index.html',
        'name': 'test-app3',
        'role': 'input',
        'icons': {
          '32': '/fake-icon-32.jpg',
          '64': '/fake-icon-64.jpg',
          '128': '/fake-icon-128.jpg'
        }
      }
    });
    fakeApp4 = new MockApp({
      'origin': 'https://test-app4.gaiamobile.org',
      'manifestURL': 'https://test-app4.gaiamobile.org/manifest.webapp',
      'manifest': {
        'launch_path': '/index.html',
        'name': 'test-app4',
        'icons': {
          '32': 'fake-icon-32.jpg',// note: this is expected 'bad' url.
          '64': '/fake-icon-64.jpg',
          '128': '/fake-icon-128.jpg'
        }
      }
    });
    fakeApp5 = new MockApp({
      'origin': 'https://test-app5.gaiamobile.org',
      'manifestURL': 'https://test-app5.gaiamobile.org/manifest.webapp',
      'manifest': {
        'launch_path': '/',
        'icons': {
          '32': '/fake-app5-32.jpg',
          '64': '/fake-app5-64.jpg',
          '128': '/fake-app5-128.jpg'
        },
        'entry_points': {
          'app5_1': {
            'launch_path': '/subapp1/index.html#hash',
            'name': 'subapp-1',
            'icons': {
              '60': '/subapp1/icon_60.png',
              '90': '/subapp1/icon_90.png',
              '120': '/subapp1/icon_120.png'
            }
          },
          'app5_2': {
            'launch_path': '/subapp2/index.html',
            'name': 'subapp-2',
            'icons': {
              '60': '/subapp2/icon_60.png',
              '90': '/subapp2/icon_90.png',
              '120': '/subapp2/icon_120.png'
            }
          }
        }
      }
    });
    fakeApp6 = new MockApp({
      'origin': 'https://test-app6.gaiamobile.org',
      'manifestURL': 'https://test-app6.gaiamobile.org/manifest.webapp',
      'manifest': {
        'type': 'certified',
        'launch_path': '/',
        'icons': {
          '32': '/fake-app6-32.jpg',
          '64': '/fake-app6-64.jpg',
          '128': '/fake-app6-128.jpg'
        },
        'entry_points': {
          'app6_1': {
            'launch_path': '/subapp1/index.html#hash',
            'name': 'subapp-1',
            'icons': {
              '60': '/subapp1/icon_60.png',
              '90': '/subapp1/icon_90.png',
              '120': '/subapp1/icon_120.png'
            }
          },
          'app6_2': {
            'launch_path': '/subapp2/index.html',
            'name': 'subapp-2',
            'icons': {
              '60': '/subapp2/icon_60.png',
              '90': '/subapp2/icon_90.png',
              '120': '/subapp2/icon_120.png'
            }
          }
        }
      }
    });
  }

  suiteSetup(function() {
    createMockApps();
    realMozApps = navigator.mozApps;
    navigator.mozApps = MockNavigatormozApps;
    origAppsMgmt = navigator.mozApps.mgmt;
    navigator.mozApps.mgmt = MockAppsMgmt;
  });

  suiteTeardown(function() {
    MockNavigatormozApps.mgmt = origAppsMgmt;
    navigator.mozApps = realMozApps;
  });

  suite('predefined apps', function() {
    suiteSetup(function() {
      MockAppsMgmt.mApps = [fakeApp1, fakeApp2, fakeApp3, fakeApp4, fakeApp5,
                            fakeApp6];
      Applications.init();
    });

    suiteTeardown(function() {
      Applications.uninit();
    });

    test('check state', function() {
      assert.isTrue(Applications._ready);
    });

    test('check app list', function() {
      assert.isUndefined(Applications.installedApps[fakeApp1.origin]);
      assert.isUndefined(Applications.installedApps[fakeApp2.origin]);
      assert.isUndefined(Applications.installedApps[fakeApp3.origin]);
      assert.isDefined(Applications.installedApps[fakeApp4.origin]);
      assert.isDefined(Applications.installedApps[fakeApp5.origin]);
      assert.isDefined(Applications.installedApps[fakeApp6.origin]);
    });

    test('getAppEntries for single entry point', function() {
      var entries = Applications.getAppEntries(fakeApp4.origin);
      assert.equal(entries.length, 1);
      assert.equal(entries[0].origin, fakeApp4.origin);
      assert.equal(entries[0].entry_point, '');
      assert.equal(entries[0].name, fakeApp4.manifest.name);
    });

    test('getAppEntries for non-certfied multiple entry points', function() {
      var entries = Applications.getAppEntries(fakeApp5.origin);
      assert.equal(entries.length, 1);
      assert.equal(entries[0].origin, fakeApp5.origin);
      assert.equal(entries[0].entry_point, '');
      assert.equal(entries[0].name, fakeApp5.manifest.name);
    });

    test('getAppEntries for certified multiple entry points', function() {
      var entries = Applications.getAppEntries(fakeApp6.origin);
      assert.equal(entries.length, 2);
      assert.equal(entries[0].origin, fakeApp6.origin);
      assert.equal(entries[0].entry_point, 'app6_1');
      assert.equal(entries[0].name, fakeApp6.manifest.entry_points.app6_1.name);
      assert.equal(entries[1].origin, fakeApp6.origin);
      assert.equal(entries[1].entry_point, 'app6_2');
      assert.equal(entries[1].name, fakeApp6.manifest.entry_points.app6_2.name);
    });

    test('getEntries for hidden app or inexist origin', function() {
      var entries = Applications.getAppEntries(fakeApp1.origin);
      assert.equal(entries.length, 0);

      entries = Applications.getAppEntries(fakeApp2.origin);
      assert.equal(entries.length, 0);

      entries = Applications.getAppEntries(fakeApp3.origin);
      assert.equal(entries.length, 0);

      entries = Applications.getAppEntries('bad origin');
      assert.equal(entries.length, 0);
    });

    test('getAllEntries', function() {
      var entries = Applications.getAllEntries();
      assert.equal(entries.length, 4);
    });

    test('launch single entry point', function(done) {
      fakeApp4.launch = function(entryPoint) {
        assert.equal(entryPoint, '');
        done();
      };
      Applications.launch(fakeApp4.origin, '');
    });

    test('launch multiple entry points', function(done) {
      fakeApp6.launch = function(entryPoint) {
        assert.equal(entryPoint, 'app6_2');
        done();
      };
      Applications.launch(fakeApp6.origin, 'app6_2');
    });

    test('getEntryManifest on single entry point', function() {
      var manifest = Applications.getEntryManifest(fakeApp4.origin, '');
      assert.equal(manifest, fakeApp4.manifest);
    });

    test('getEntryManifest on multiple entry points', function() {
      var manifest = Applications.getEntryManifest(fakeApp6.origin, 'app6_1');
      assert.equal(manifest, fakeApp6.manifest.entry_points.app6_1);

      manifest = Applications.getEntryManifest(fakeApp6.origin, 'app6_2');
      assert.equal(manifest, fakeApp6.manifest.entry_points.app6_2);
    });

    test('getName on single entry point', function() {
      var name = Applications.getName(fakeApp4.origin);
      assert.equal(name, fakeApp4.manifest.name);
    });

    test('getName on multiple entry points', function() {
      var name = Applications.getName(fakeApp6.origin, 'app6_1');
      assert.equal(name, fakeApp6.manifest.entry_points.app6_1.name);

      name = Applications.getName(fakeApp6.origin, 'app6_2');
      assert.equal(name, fakeApp6.manifest.entry_points.app6_2.name);
    });

    suite('XHR', function() {
      var fakeXHR;
      var fakeBlob;

      suiteSetup(function() {
        fakeBlob = new Blob(['fake blob'], {'type': 'image/jpeg'});
      });

      setup(function() {
        fakeXHR = this.sinon.useFakeXMLHttpRequest();
      });

      teardown(function() {
        fakeXHR.restore();
      });

      function doGetIconBlobTest(origin, entryPoint, prefer, iconUrl, xhrCalled,
                                 failedOnXHR, done) {

        Applications.getIconBlob(origin, entryPoint, prefer, function(blob) {
          if (!xhrCalled || failedOnXHR) {
            assert.isUndefined(blob);
          } else {
            assert.equal(blob, fakeBlob);
          }
          done();
        });

        setTimeout(function() {
          if (!xhrCalled) {
            assert.equal(fakeXHR.requests.length, 0);
            return;
          }
          assert.equal(fakeXHR.requests.length, 1);
          assert.equal(fakeXHR.requests[0].url,
                       iconUrl);
          assert.equal(fakeXHR.requests[0].responseType, 'blob');
          // sinon's fakeXHR doesn't support responseType=blob, and onload, we
          // need to call onload by ourself.
          if (failedOnXHR) {
            fakeXHR.requests[0].onerror({'type': 'expected error'});
          } else {
            fakeXHR.requests[0].response = fakeBlob;
            fakeXHR.requests[0].status = 200;
            fakeXHR.requests[0].onload();
          }
        });
      }

      test('getIconBlob for single entry point', function(done) {
        doGetIconBlobTest(fakeApp4.origin, '', 60,
                          'https://test-app4.gaiamobile.org/fake-icon-64.jpg',
                          true, false, done);
      });

      test('getIconBlob failed', function(done) {
        doGetIconBlobTest(fakeApp4.origin, '', 60,
                          'https://test-app4.gaiamobile.org/fake-icon-64.jpg',
                          true, true, done);
      });

      test('getIconBlob for multiple entry points', function(done) {
        doGetIconBlobTest(fakeApp6.origin, 'app6_1', 60,
                         'https://test-app6.gaiamobile.org/subapp1/icon_60.png',
                          true, false, done);
      });

      test('getIconBlob prefer small icon', function(done) {
        // We use a bad icon url. the XHR won't be called.
        doGetIconBlobTest(fakeApp4.origin, '', 1,
                          'https://test-app4.gaiamobile.org/fake-icon-32.jpg',
                          false, false, done);
      });

      test('getIconBlob prefer large icon', function(done) {
        doGetIconBlobTest(fakeApp4.origin, '', 1000,
                          'https://test-app4.gaiamobile.org/fake-icon-128.jpg',
                          true, false, done);
      });
    });
  });

  suite('install app and uninstall app', function() {
    suiteSetup(function() {
      Applications.init();
    });

    suiteTeardown(function() {
      Applications.uninit();
    });

    test('install hidden app', function() {
      MockAppsMgmt.mTriggerOninstall(fakeApp1);
      assert.isUndefined(Applications.installedApps[fakeApp1.origin]);

      MockAppsMgmt.mTriggerOninstall(fakeApp2);
      assert.isUndefined(Applications.installedApps[fakeApp2.origin]);

      MockAppsMgmt.mTriggerOninstall(fakeApp3);
      assert.isUndefined(Applications.installedApps[fakeApp3.origin]);
    });

    test('install/uninstall visible app', function() {
      MockAppsMgmt.mTriggerOninstall(fakeApp4);
      assert.isDefined(Applications.installedApps[fakeApp4.origin]);
      MockAppsMgmt.mTriggerOnuninstall(fakeApp4);
      assert.isUndefined(Applications.installedApps[fakeApp4.origin]);
    });
  });

});
