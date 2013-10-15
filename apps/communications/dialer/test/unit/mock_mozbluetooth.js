'use strict';

var MockMozBluetooth = {
  _mAdapter: {},
  _mDomRequest: {},

  init: function mmb_minit() {
    this._mAdapter = {};
    this._mDomRequest = {};
  },

  getDefaultAdapter: function mmb_getDefaultAdapter() {
    this._mDomRequest.result = this._mAdapter;
    return this._mDomRequest;
  },

  // MockEvents Trigger
  triggerOnGetAdapterSuccess: function mmb_triggerAdapterRequestSuccess() {
    if (this._mDomRequest.onsuccess) {
      this._mDomRequest.onsuccess();
    }
  },

  triggerOnScostatuschanged: function mmb_triggerScostatuschanged(connected) {
    if (this._mAdapter.onscostatuschanged) {
      this._mAdapter.onscostatuschanged({status: connected});
    }
  }
};
