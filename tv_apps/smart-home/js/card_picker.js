/* global evt, KeyNavigationAdapter, SpatialNavigator, Folder, Deck,
          CardUtil */

(function(exports) {
  'use strict';

  function CardPicker() {}

  CardPicker.prototype = evt({
    container: document.getElementById('folder-editor'),
    gridView: document.getElementById('folder-editor-grid-view'),

    hideCardpickerButton: document.getElementById('hide-cardpicker-button'),

    init: function(options) {
      this.appButtons = [];

      this._onfinish = options && options.onfinish;
      this._cardManager = options.cardManager;

      this.navigableElements = [
        CardPicker.prototype.hideCardpickerButton
      ];

      this.container.addEventListener('click', this.focus.bind(this));

      this._spatialNavigator = new SpatialNavigator(this.navigableElements);
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

      this.refresh();
    },

    onFocus: function(elem) {
      elem.focus();
      if (elem.classList.contains('app-button')) {
        this._scrollTo(elem);
      }
    },

    onUnfocus: function(elem) {
    },

    onEnter: function() {
      var elem = this._spatialNavigator.getFocusedElement();
      if (elem.classList.contains('app-button')) {
        elem.classList.toggle('selected');
      }

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


      return appButton;
    },

    show: function() {
      this.refresh();
      this.container.classList.remove('hidden');
    },

    hide: function() {
      this.container.classList.add('hidden');
      this._onfinish && this._onfinish();
    },

    refresh: function() {
      this._cardManager.getCardList()
        .then(this._refreshCardButtons.bind(this))
        .then(() => {
          this._spatialNavigator.setCollection(
                            this.appButtons.concat(this.navigableElements));
          this._spatialNavigator.focus(this.appButtons[0]);
        });
    },

    _refreshCardButtons: function(cardList, options) {
      this.appButtons = [];
      this.gridView.innerHTML = '';

      cardList.forEach(card => {
        if(card instanceof Folder || card instanceof Deck) {
          return;
        }

        var appButton = CardUtil.createCardButton(card);
        this.gridView.appendChild(appButton);
        this.appButtons.push(appButton);
      });
      return true;
    },

    focus: function() {
      this._spatialNavigator.focus();
    },

    get isShown() {
      return !this.container.classList.contains('hidden');
    },

    get selectedElements() {
      return this.gridView.getElementsByClassName('selected');
    }
  });

  exports.CardPicker = CardPicker;
}(window));