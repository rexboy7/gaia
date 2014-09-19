/* globals DeviceSelector */
'use strict';

(function(exports) {
  function DeviceSelector() {}

  DeviceSelector.prototype = {
    start: function ds_start() {
      window.addEventListener('mozChromeEvent', this);
      this.selectorElement =
        document.getElementById('presentation-device-selector');
      this.selectorElement.hidden = true;

      this.selectorElement.addEventListener('blur',
        this.sendSelectedDevice.bind(this));
      this.selectorElement.addEventListener('blur', function() {
        this.selectorElement.hidden = true;
      }.bind(this));

    },

    sendSelectedDevice: function ds_sendSelectedDevice() {
      var deviceInfo = JSON.parse(
        this.selectorElement.options[this.selectorElement.selectedIndex].value);

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
      switch (detail.type) {
        case 'select-device':
          this.selectorElement.hidden = false;
          this.selectorElement.innerHTML = '';
          var devices = evt.detail.devices;
          for(var i = 0; i < devices.length; i++) {
            var option = document.createElement('option');
            option.value = JSON.stringify(devices[i]);
            option.textContent = devices[i].name;
            this.selectorElement.appendChild(option);
          }
          this.selectorElement.focus();
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

