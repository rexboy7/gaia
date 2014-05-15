/* globals ConnectionServiceManager, ContentDirectoryManager, AVTManager,
   DeviceManager */
'use strict';

function EasyPlayer() {
  window.connectionServiceManager = new ConnectionServiceManager().init();
  ContentDirectoryManager.init();
  window.avtManager = new AVTManager().init();
  window.deviceManager = new DeviceManager().init();
}

window.easyPlayer = new EasyPlayer();
