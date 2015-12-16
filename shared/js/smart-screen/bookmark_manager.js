/* global CardStore, evt */

(function(exports) {
  'use strict';

  var bookmarkManager = evt({
    TABLE_NAME: 'appdeck_bookmarks',

    init: function bm_init(ownerURL, mode) {
      this._mode = mode;
      this._store = new CardStore(this.TABLE_NAME, mode, ownerURL);
      this._store.on('change', this.fire.bind(this, 'change'));

      /* For Testing only */
      this.getLength().then(length => {
        if (length <= 0) {
          this.add({
            name: 'google',
            url: 'http://www.google.com',
            iconUrl: 'https://www.google.com.tw/images/branding/googlelogo' +
            '/1x/googlelogo_color_272x92dp.png'
          });
          this.add({
            name: 'youtube',
            url: 'http://www.youtube.com',
            iconUrl: 'https://www.google.com.tw/images/branding/googlelogo' +
            '/1x/googlelogo_color_272x92dp.png'
          });
        }
      });
    },

    iterate: function bm_foreach(cb) {
      this._store.iterateData(cb);
    },

    add: function bm_add(entry) {
      if (entry.iconUrl) {
        return this.fetchIcon(entry.iconUrl).then(iconData => {
          entry.icon = iconData;
          delete entry.iconUrl;
          this._store.addData(entry);
        }).catch(() => {
          this._store.addData(entry);
        });
      } else {
        return this._store.addData(entry);
      }
    },

    remove: function bm_remove(id) {
      return this._store.removeData(id);
    },

    get: function bm_get(id) {
      return this._store.getData(id);
    },

    set: function bm_set(id, entry) {
      if (entry.iconUrl) {
        return this.fetchIcon(entry.iconUrl).then(iconData => {
          entry.icon = iconData;
          delete entry.iconUrl;
          this._store.saveData(id, entry);
        }).catch(() => {
          this._store.saveData(id, entry);
        });
      } else {
        return this._store.saveData(id, entry);
      }
    },

    fetchIcon: function bm_fetchIcon(url) {
      return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest({mozSystem: true});
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();

        xhr.onload = function() {
          var reader = new FileReader();
          reader.readAsDataURL(xhr.response);

          reader.onloadend = function() {
            resolve(reader.result);
          };
        };

        xhr.onerror = function() {
          console.warn('Unable to retrive icon data. Leaving icon empty.');
          reject();
        };
      });
    },

    getLength: function bm_getLength() {
      return this._store.getLength();
    }
  });

  exports.bookmarkManager = bookmarkManager;
}(window));

