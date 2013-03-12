var MockMozL10n = {
  get: function get(key) {
    return key;
  },
  DateTimeFormat: function() {
    this.localeFormat = function(date, format) {
      return date;
    };
  },
  language: {
    code: 'en',
    dir: 'ltr'
  }
};
