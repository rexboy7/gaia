/* global Home, evt */

(function(exports) {
  'use strict';

  function CardPicker() {};

  var fakeData;

  CardPicker.prototype = evt({
    container: document.getElementById('folder-editor'),
    gridView: document.getElementById('folder-editor-grid-view'),

    hideCardpickerButton: document.getElementById('hide-cardpicker-button'),

    init: function(options) {
      this.appButtons = [];
      // debugger;
      this._onfinish = options && options.onfinish;

      this.navigableElements = [
        CardPicker.prototype.hideCardpickerButton
      ];

      fakeData.forEach(card => {
        var appButton = this._createCardElement(card);
        this.gridView.appendChild(appButton);
        this.appButtons.push(appButton);
      });

      this._spatialNavigator = new SpatialNavigator(
                              this.appButtons.concat(this.navigableElements));
      this._spatialNavigator.on('focus', this.onFocus.bind(this));
      this._spatialNavigator.on('unfocus', this.onUnfocus.bind(this));
      this._spatialNavigator.focus();

      this.hideCardpickerButton.addEventListener('click', this.hide.bind(this));

      this._keyNavigationAdapter = new KeyNavigationAdapter();
      this._keyNavigationAdapter.init(this.container);
      this._keyNavigationAdapter.on('move', direction => {
        this._spatialNavigator.move(direction);
      });
      this._keyNavigationAdapter.on('enter-keyup', this.onEnter.bind(this));

    },

    onFocus: function(elem) {
      elem.focus();
      this._scrollTo(elem);
    },

    onUnfocus: function(elem) {
    },

    onEnter: function(elem) {

    },

    _scrollTo: function ad_scrollTo(elem) {
      var scrollY = (elem.offsetTop - this.gridView.offsetTop) -
              (this.gridView.offsetHeight - elem.offsetHeight) / 2;
      this.gridView.scrollTo(0, scrollY);
    },

    _createCardElement: function cp_createCardElement(card) {
      var appButton = document.createElement('smart-button');
      var label = document.createElement('span');
      appButton.dataset.manifestURL = card.manifestURL;
      appButton.dataset.entryPoint = card.entryPoint;
      appButton.dataset.name = card.name;
      appButton.dataset.removable = card.removable;
      appButton.setAttribute('type', 'app-button');
      appButton.setAttribute('app-type', 'app');
      appButton.classList.add('app-button');
      appButton.classList.add('navigable');
      label.textContent = card.name;
      label.className = 'name';
      appButton.appendChild(label);

      //this._fillAppButtonIcon(app, appButton);

      return appButton;
    },

    show: function() {
      this.container.classList.remove('hidden');
      this._spatialNavigator.focus();
    },

    hide: function() {
      this.container.classList.add('hidden');
      Home.focus();
    },

    focus: function() {

    }
  })

  fakeData = [{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    },{
      manifestURL: 'http://www.google.com',
      entryPoint: '/index.html',
      name: 'google',
      removable: true
    }];
  exports.CardPicker = CardPicker;
}(window));