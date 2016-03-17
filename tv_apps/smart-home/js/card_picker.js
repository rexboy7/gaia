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

      this._selectedElements = this.gridView.getElementsByClassName('selected');

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

    show: function() {
      this.refresh();
      this.container.classList.remove('hidden');
      this.focus();
    },

    hide: function() {
      this.container.classList.add('hidden');
      this._onfinish && this._onfinish();
      this.fire('hide');
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

    saveToNewFolder: function(index) {
      if (this.selected.length <= 0) {
        return;
      }

      var folder = this._cardManager.insertNewFolder(
          {id: 'new-folder'}, index);
      this.saveToFolder(folder);
      return folder;
    },

    saveToFolder: function(folder) {
      for (var i = 0; i < this.selected.length; i++) {
        var card = this._cardManager.findCardFromCardList({
          cardId: this.selected[i].dataset.cardId
        });
        this._cardManager.removeCard(card);
        folder.addCard(card);
      }
    },

    get isShown() {
      return !this.container.classList.contains('hidden');
    },

    get selected() {
      return this._selectedElements;
    }
  });

  exports.CardPicker = CardPicker;
}(window));