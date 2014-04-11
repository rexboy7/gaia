'use strict';

(function(exports) {

  exports.MockhomescreenConnection = {
    _denied: false,
    _result: null,
    deny: function() {
      this._denied = true;
      this._result = null;
    },
    response: function(result, requestId, action, widgetId) {
      this._denied = false;
      this._result = {
        'result': result,
        'requestId': requestId,
        'action': action,
        'widgetId': widgetId
      };
    },
    confirm: function() {
      this._denied = false;
      this._result = null;
    }
  };
})(window);
