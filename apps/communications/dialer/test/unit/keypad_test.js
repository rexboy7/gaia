requireApp('communications/dialer/js/keypad.js');

requireApp('communications/dialer/test/unit/mock_call_screen.js');
requireApp('communications/dialer/test/unit/mock_recents.js');
requireApp('communications/dialer/test/unit/mock_recents_db.js');

// We're going to swap those with mock objects
// so we need to make sure they are defined.
if (!this.CallScreen) {
  this.CallScreen = null;
}

if (!this.LazyL10n) {
  this.LazyL10n = null;
}

if (!this.Recents) {
  this.Recents = null;
}

if (!this.RecentsDBManager) {
  this.RecentsDBManager = null;
}

suite('keypad', function() {
  var subject;

  var realCallScreen;
  var realLazyL10n;
  var realRecents;
  var realRecentsDBManager;

  suiteSetup(function() {
    console.log("bitch;l");
    realCallScreen = window.CallScreen;
    window.CallScreen = MockCallScreen;

    realRecents = window.Recents;
    window.Recents = MockRecents;

    realRecentsDBManager = window.RecentsDBManager;
    window.RecentsDBManager = MockRecentsDBManager;

    realLazyL10n = LazyL10n;
    window.LazyL10n = {
      get: function get(cb) {
        cb(function l10n_get(key) {
          return key;
        });
      }
    };

    KeypadManager.init();
  });

  suiteTeardown(function() {
    window.CallScreen = realCallScreen;
    window.Recents = realRecents;
    window.RecentsDBManager = realRecentsDBManager;
    window.LazyL10n = realLazyL10n;

  });
});
