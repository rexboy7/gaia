/* globals ServiceManager, Plug */
'use strict';

(function(exports){
  function AVTManager () {

  }

  AVTManager.prototype = {
    __proto__: ServiceManager.prototype,

    listElementId: 'AVTList',
    serviceType: 'upnp:urn:schemas-upnp-org:service:AVTransport:1',
    serviceConstructor: Plug.UPnP_AVTransport,

    serverView: function avtm_serverView(serviceWrapper) {
      var option = document.createElement('option');
      option.value = serviceWrapper.svc.id;
      option.textContent = serviceWrapper.friendlyName;

      return option;
    }
  };
  exports.AVTManager = AVTManager;
})(window);
