'use strict';

(function (exports){
  function DeviceManager() {

  }

  DeviceManager.prototype = {
    devices: {},

    init: function dm_init() {

    },

    _popDeviceId: function dm_popDeviceId(serviceId) {
      return serviceId.split('::')[0];
    },

    getDeviceByService: function dm_getDeviceByService(serviceId) {
      return this.devices[this._popDeviceId(serviceId)];
    },

    addService: function dm_addService(service) {
      var deviceId = this._popDeviceId(service.id);
      if (this.devices[deviceId]) {
        this.devices[deviceId][service.id] = service;
      } else {
        this.devices[deviceId] = {serviceId: service};
      }
    },

    removeService: function dm_removeService(serviceId) {
      var deviceId = this._popDeviceId(serviceId);
      if (this.devices[deviceId]) {
        return;
      }
      delete this.devices[deviceId][serviceId];
    },

    removeDevice: function dm_removeDevice(deviceId) {
      delete this.devices[deviceId];
    }
  };

  exports.DeviceManager = DeviceManager;
}(window));
