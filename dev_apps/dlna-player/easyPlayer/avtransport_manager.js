/* globals ServiceManager, Plug */
'use strict';

(function(exports){
  function AVTManager () {

  }

  AVTManager.prototype = {
    __proto__: ServiceManager.prototype,

    listElementId: 'AVTList',
    serviceType: 'upnp:urn:schemas-upnp-org:service:AVTransport:1',
    serviceConstructor: Plug.UPnP_AVTransport
  };
  exports.AVTManager = AVTManager;
})(window);
