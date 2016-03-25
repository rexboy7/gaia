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
      this._folder = null;

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

    show: function(folderElem) {
      this.refresh(folderElem);
      this.container.classList.remove('hidden');
      this.focus();
    },

    hide: function() {
      this.container.classList.add('hidden');
      this._onfinish && this._onfinish();
      this.fire('hide');
    },

    refresh: function(folderElem) {
      var folderList = null;
      if (folderElem) {
        this._folder = this._cardManager.findCardFromCardList({
          cardId: folderElem.dataset.cardId
        });
        folderList = this._folder.getCardList();
      }

      this._cardManager.getCardList()
        .then(cardList => {
          this._refreshCardButtons(folderList, cardList);
          this._spatialNavigator.setCollection(
                            this.appButtons.concat(this.navigableElements));
          this._spatialNavigator.focus(this.appButtons[0]);
        });
    },

    _refreshCardButtons: function(folderList, cardList, options) {
      this.appButtons = [];
      this.gridView.innerHTML = '';

      var that = this;
      function createButtonHelper(card) {
        if(card instanceof Folder || card instanceof Deck) {
          return;
        }

        var appButton = CardUtil.createCardButton(card);
        that.gridView.appendChild(appButton);
        that.appButtons.push(appButton);
        return appButton;
      }

      folderList && folderList.forEach(card => {
        var appButton = createButtonHelper(card);
        if (appButton) {
          appButton.dataset.parentType = 'folder';
          appButton.classList.add('selected');
        }
      });

      cardList && cardList.forEach(card => {
        var appButton = createButtonHelper(card);
        if (appButton) {
          appButton.dataset.parentType = 'empty';
        }
      });
    },

    focus: function() {
      this._spatialNavigator.focus();
    },

    saveToNewFolder: function(position) {
      if (this.selected.length <= 0) {
        return;
      }

      this._folder = this._cardManager.insertNewFolder(
          {id: 'new-folder'}, position);

      this._saveToFolderHelper();
      return this._folder;
    },

    _saveToFolderHelper: function() {
      if (!this._folder) {
        return;
      }

      for (var i = 0; i < this.selected.length; i++) {
        var button = this.selected[i];
        if (button.dataset.parentType === 'folder') {
          continue;
        }

        var card = this._cardManager.findCardFromCardList({
          cardId: button.dataset.cardId
        });
        this._cardManager.removeCard(card);
        this._folder.addCard(card);
      }
    },

    updateFolder: function() {
      if (!this._folder) {
        return;
      }
      // Moves cards previously inside the folder back to cardList
      this.appButtons.every(elem => {
        // Buttons previously inside the folder are in the start of the array
        // and we want to process them only.
        if (elem.dataset.parentType !== 'folder') {
          return false;
        }
        if (!elem.classList.contains('selected')) {
          var card = this._folder.findCard({
            cardId: elem.dataset.cardId
          });
          this._folder.removeCard(card);
          this._cardManager.insertCard({
            card: card,
            position: 'end'
          });
        }
        return true;
      });

      // Then save newly added ones
      this._saveToFolderHelper();

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