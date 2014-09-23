/* global ScreenLayout, Settings, SettingsListener */
'use strict';

var Developer = {
  presentationDevices: document.getElementById('presentation-devices'),
  selectedDeviceValue: null,

  init: function about_init() {
    document.getElementById('ftuLauncher').onclick = this.launchFTU;

    // hide software home button whenever the device has no hardware home button
    if (!ScreenLayout.getCurrentLayout('hardwareHomeButton')) {
      document.getElementById('software-home-button').style.display = 'none';
      // always set homegesture enabled on tablet, so hide the setting
      if (!ScreenLayout.getCurrentLayout('tiny')) {
        document.getElementById('homegesture').style.display = 'none';
      }
    }
    SettingsListener.observe('presentation.sender.selecteddevice', null,
      function(value) {
        this.selectedDeviceValue = value;
      }.bind(this));
    SettingsListener.observe('presentation.sender.discovereddevices', null,
      this.updateDevices.bind(this));
  },


  updateDevices: function about_updateDevices(devices) {
    var self = this;
    var found = false;
    this.presentationDevices.innerHTML = null;
    devices && devices.forEach(function(device) {
      var elem = document.createElement('option');
      elem.value = device.name;
      elem.textContent = device.name;
      if (device.name == self.selectedDeviceValue) {
        elem.selected = true;
        found = true;
      }
      self.presentationDevices.appendChild(elem);
    });
    if (!found) {
      var elem = document.createElement('option');
      elem.value = this.selectedDeviceValue;
      elem.textContent = this.selectedDeviceValue + '(offline)';
      elem.selected = true;
      this.presentationDevices.appendChild(elem);
    }
  },

  launchFTU: function about_launchFTU() {
    var settings = Settings.mozSettings;
    if (!settings) {
      return;
    }

    var key = 'ftu.manifestURL';
    var req = settings.createLock().get(key);
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
      navigator.mozApps.mgmt.getAll().onsuccess = function gotApps(evt) {
        var apps = evt.target.result;
        for (var i = 0; i < apps.length && ftuApp == null; i++) {
          var app = apps[i];
          if (app.manifestURL == ftuManifestURL) {
            ftuApp = app;
          }
        }

        if (ftuApp) {
          ftuApp.launch();
        } else {
          alert(navigator.mozL10n.get('no-ftu'));
        }
      };
    };
  }
};

navigator.mozL10n.once(Developer.init.bind(Developer));
