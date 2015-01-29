/**
 * Handle support panel functionality with SIM and without SIM
 *
 * @module developer/developer
 */
define(function(require) {
  'use strict';

  var DialogService = require('modules/dialog_service');
  var AppsCache = require('modules/apps_cache');
  var ScreenLayout = require('shared/screen_layout');
  var SettingsCache = require('modules/settings_cache');

  /**
   * @alias module:developer/developer
   * @class Developer
   * @returns {Developer}
   */
  var Developer = function() {
    this._elements = null;
  };

  Developer.prototype = {
    /**
     * Initialization.
     *
     * @access public
     * @memberOf Developer.prototype
     * @param  {HTMLElement} elements
     */
    init: function d_init(elements) {
      this._elements = elements;

      this._elements.ftuLauncher.addEventListener('click', this._launchFTU);

      // hide software home button whenever the device has no hardware
      // home button
      if (!ScreenLayout.getCurrentLayout('hardwareHomeButton')) {
        this._elements.softwareHomeButton.style.display = 'none';
        // always set homegesture enabled on tablet, so hide the setting
        if (!ScreenLayout.getCurrentLayout('tiny')) {
          this._elements.homegesture.style.display = 'none';
        }
      }

      if (navigator.mozPower) {
        this._elements.resetButton.disabled = false;
        this._elements.resetButton.addEventListener('click',
          this._resetDevice.bind(this));
      } else {
        // disable button if mozPower is undefined or can't be used
        this._elements.resetButton.disabled = true;
      }

      this._initDeviceList();
    },

    _initDeviceList: function d_initDeviceList() {
      this._deviceList = [];
      navigator.mozPresentationDeviceInfo.getAll().then(function(list) {
        this._deviceList = list || [];
        this._updateDeviceUI();
      }.bind(this));

      navigator.mozPresentationDeviceInfo.addEventListener('devicechange',
        function(evt) {
          switch (evt.detail.type) {
            case 'add':
              this._addDevice(evt.detail.deviceInfo);
              this._updateDeviceUI();
              break;
            case 'remove':
              this._removeDevice(evt.detail.deviceInfo);
              this._updateDeviceUI();
              break;
            case 'update':
              this._updateDevice(evt.detail.deviceInfo);
              this._updateDeviceUI();
              break;
          }
        }.bind(this));
    },

    _addDevice: function d_addDevice(dev) {
      this._deviceList.push(dev);
      this._deviceList.sort(function(a, b) {
        return a.name > b.name ? 1 : (a.name < b.name ? -1 : 0);
      });
    },

    _removeDevice: function d_removeDevice(dev) {
      var idx = this._deviceList.findIndex(function(item) {
        return item.id === dev.id;
      });
      this._deviceList.splice(idx, 1);
    },

    _updateDevice: function d_updateDevice(dev) {
      this._deviceList.some(function(item) {
        if (item.id === dev.id) {
          item.name = dev.name;
          return true;
        } else {
          return false;
        }
      });
      this._deviceList.sort(function(a, b) {
        return a.name > b.name ? 1 : (a.name < b.name ? -1 : 0);
      });
    },

    _updateDeviceUI: function d_updateDeviceUI() {
      var deviceListUI = document.getElementById('presentation-devices');

      while(deviceListUI.firstChild) {
        deviceListUI.removeChild(deviceListUI.firstChild);
      }

      SettingsCache.getSettings(function(cache) {
        var selected = cache['presentation.sender.selecteddevice'];
        this._deviceList.forEach(function(item) {
          var option = document.createElement('option');
          option.textContent = item.name;
          option.value = item.id;
          option.selected = (item.id === selected);
          deviceListUI.appendChild(option);
        });
        if (selected === null || typeof(selected) === 'undefined') {
          deviceListUI.selectedIndex = 0;
        }
      }.bind(this));
    },

    /**
     * launch FTU app.
     *
     * @access private
     * @memberOf Developer.prototype
     */
    _launchFTU: function d__launchFTU() {
      var key = 'ftu.manifestURL';
      var req = navigator.mozSettings.createLock().get(key);
      req.onsuccess = function ftuManifest() {
        var ftuManifestURL = req.result[key];

        // fallback if no settings present
        if (!ftuManifestURL) {
          ftuManifestURL = document.location.protocol +
            '//ftu.gaiamobile.org' +
            (location.port ? (':' + location.port) : '') +
            '/manifest.webapp';
        }

        var ftuApp = null;
        AppsCache.apps().then(function(apps) {
          for (var i = 0; i < apps.length && ftuApp === null; i++) {
            var app = apps[i];
            if (app.manifestURL === ftuManifestURL) {
              ftuApp = app;
            }
          }

          if (ftuApp) {
            ftuApp.launch();
          } else {
            DialogService.alert('no-ftu', {title: 'no-ftu'});
          }
        });
      };
    },

    /**
     * popup warning dialog.
     *
     * @access private
     * @memberOf Developer.prototype
     */
    _resetDevice: function d__resetDevice() {
      require(['modules/dialog_service'], (DialogService) => {
        DialogService.confirm('reset-devtools-warning-body', {
          title: 'reset-devtools-warning-title',
          submitButton: 'reset',
          cancelButton: 'cancel'
        }).then((result) => {
          var type = result.type;
          if (type === 'submit') {
            this._wipe();
          }
        });
      });
    },

    /**
     * Reset and enable full DevTools access.
     *
     * @access private
     * @memberOf Developer.prototype
     */
    _wipe: function about__wipe() {
      var power = navigator.mozPower;
      if (!power) {
        console.error('Cannot get mozPower');
        return;
      }
      if (!power.factoryReset) {
        console.error('Cannot invoke mozPower.factoryReset()');
        return;
      }
      power.factoryReset('root');
    }
  };

  return function ctor_developer_panel() {
    return new Developer();
  };
});
