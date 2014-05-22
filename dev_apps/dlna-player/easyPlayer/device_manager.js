'use strict';

(function (exports){
  function DeviceManager() {

  }

  DeviceManager.prototype = {
    devices: {},

    init: function dm_init() {
      return this;
    },

    _popDeviceId: function dm_popDeviceId(serviceId) {
      return serviceId.split('::')[0];
    },

    getDeviceByService: function dm_getDeviceByService(serviceId) {
      return this.devices[this._popDeviceId(serviceId)];
    },

    addService: function dm_addService(serviceWrapper) {
      var deviceId = this._popDeviceId(serviceWrapper.svc.id);
      if (!this.devices[deviceId]) {
        this.devices[deviceId] = {};
      }
      this.devices[deviceId][serviceWrapper.svc.id] = serviceWrapper;
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
    },

    play: function dm_play(serviceId, mediaUrl, mediaMetadata) {
      var deviceId = this._popDeviceId(serviceId);
      var avtService = this.devices[deviceId][serviceId];
      var connectionService;
      for (var sid in this.devices[deviceId]) {
        if(sid.indexOf('ConnectionManager') != -1) {
          connectionService = this.devices[deviceId][sid];
        }
      }
      avtService.stop(0).then(function(e) {
        return avtService.setAVTransportURI(0, mediaUrl, mediaMetadata);
      }).then(function(e) {
        return avtService.play(0).then(function() {
          return avtManager.updateMediaInfo();
        });
      }).then(null, function(e) {
        console.log('Error:' + e.description);
      });
    }
  };

  exports.DeviceManager = DeviceManager;
}(window));
