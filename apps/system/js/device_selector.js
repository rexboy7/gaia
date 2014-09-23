/* globals DeviceSelector, SettingsHelper */
'use strict';

(function(exports) {
  function DeviceSelector() {}

  DeviceSelector.prototype = {
    start: function ds_start() {
      window.addEventListener('mozChromeEvent', this);
    },

    sendSelectedDevice: function ds_sendSelectedDevice(deviceInfo) {
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent('mozContentEvent', true, true, {
        type: 'select-device-result',
        device: deviceInfo
      });
      window.dispatchEvent(event);
    },

    handleEvent: function ds_handleEvent(evt) {
      var detail = evt.detail;
      if (!detail) {
        return;
      }
      var devices = detail.devices;
      switch (detail.type) {
        case 'select-device':
          SettingsHelper('presentation.sender.selecteddevice').get(
          function(selectedDevice) {
            for(var i = 0; i < devices.length; i++) {
              if (devices[i].name == selectedDevice) {
                this.sendSelectedDevice(devices[i]);
              }
            }
            if (i == devices.length) {
              console.warn(
                'Unable to find a receiver device for Presentation. ' +
                'Pick one randomly.');
              this.sendSelectedDevice(devices[0]);
            }
          }.bind(this));
      }
    }
  };

  exports.DeviceSelector = DeviceSelector;
}(window));

var deviceSelector = new DeviceSelector();
deviceSelector.start();

/*
setTimeout(function() {
  window.addEventListener('mozContentEvent', function webpageopentest(evt) {
    if (evt.detail.type == 'select-device-result') {
      window.removeEventListener('mozContentEvent', webpageopentest);
      console.log("successful");
      console.log(JSON.stringify(evt.detail.device));
    }
  });
  window.dispatchEvent(new CustomEvent('mozChromeEvent', {detail: {
    type: 'select-device',
    devices: [ { name: 'device-A', ip: 'some-stingA', port: 8080 },
               { name: 'device-B', ip: 'some-stingB', port: 8080 }, ]
  }}));
}, 30000); */

