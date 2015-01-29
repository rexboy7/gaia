/* globals DeviceSelector, SettingsHelper */
'use strict';

(function(exports) {
  function DeviceSelector() {}

  DeviceSelector.prototype = {
    start: function ds_start() {
      window.addEventListener('mozChromeEvent', this);
      this.findDefaultDevice();
    },

    findDefaultDevice: function ds_findDefaultDevice() {
      navigator.mozPresentationDeviceInfo.getAll().then(function(list) {
        if (list.length) {
          this._defaultDevice = list[0];
        }
      }.bind(this));

      navigator.mozPresentationDeviceInfo.addEventListener('devicechange',
        function(evt) {
          if (evt.detail.type === 'add') {
            this._defaultDevice = evt.detail.deviceInfo;
          }
        });
    },

    sendSelectedDevice: function ds_sendSelectedDevice(deviceId, reqId) {
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent('mozContentEvent', true, true, {
        'type': 'presentation-select-result',
        'deviceId': deviceId,
        'id': reqId
      });
      window.dispatchEvent(event);
    },

    sendDeny: function ds_sendSelectedDevice(reqId) {
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent('mozContentEvent', true, true, {
        'type': 'presentation-select-deny',
        'id': reqId
      });
      window.dispatchEvent(event);
    },

    handleEvent: function ds_handleEvent(evt) {
      var detail = evt.detail;
      if (!detail) {
        return;
      }
      switch (detail.type) {
        case 'presentation-select-device':
          SettingsHelper('presentation.sender.selecteddevice').get(
          function(selectedDevice) {
            if (selectedDevice !== null &&
                (typeof selectedDevice) !== 'undefined') {
              this.sendSelectedDevice(selectedDevice, detail.id);
            } else if (this._defaultDevice) {
              this.sendSelectedDevice(this._defaultDevice.id, detail.id);
            } else {
              this.sendDeny(detail.id);
            }
          }.bind(this));
      }
    }
  };

  exports.DeviceSelector = DeviceSelector;
}(window));

var deviceSelector = new DeviceSelector();
deviceSelector.start();
