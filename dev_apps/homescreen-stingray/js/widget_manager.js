'use strict';

(function(exports) {

  var WidgetManager = function(app) {
    this.app = app;
    this.runningWidgetsById = {};
    this.widgetOverlay = document.getElementsByClassName('widget-overlay')[0];
  };

  WidgetManager.prototype = {
    start: function() {
      window.addEventListener('widgetcreated', this);
      window.addEventListener('widgetterminated', this);
      window.addEventListener('launchwidget', this);
      window.addEventListener('homescreen-action-object', this);
      window.addEventListener('homescreenopened', this);
      window.addEventListener('appwillopen', this);
      return this;
    },
    stop: function() {
      window.removeEventListener('widgetcreated', this);
      window.removeEventListener('widgetterminated', this);
      window.removeEventListener('launchwidget', this);
      window.removeEventListener('homescreen-action-object', this);
      window.removeEventListener('homescreenopened', this);
      window.removeEventListener('appwillopen', this);
    },

    update: function(instanceID, args) {
      var app = this.runningWidgetsById[instanceID];
      app.setStyle(args);
    },

    hideAll: function() {
      this.widgetOverlay.style.display = 'none';
      this.publish('hidewidget');
    },

    showAll: function() {
      this.widgetOverlay.style.display = 'block';
      this.publish('showwidget');
    },

    getWidget: function(instanceID) {
      return this.runningWidgetsById[instanceID];
    },

    remove: function(instanceID) {
      if (this.runningWidgetsById[instanceID]) {
        this.runningWidgetsById[instanceID].destroy();
        return true;
      } else {
        return false;
      }
    },

    handleEvent: function(evt) {
      var instanceID;
      console.log(evt.type);
      switch (evt.type) {
        case 'homescreenopened':
          for (instanceID in this.runningWidgetsById) {
            this.runningWidgetsById[instanceID].setVisible(true);
          }
          break;
        case 'appwillopen':
          for (instanceID in this.runningWidgetsById) {
            this.runningWidgetsById[instanceID].setVisible(false);
          }
          break;
        case 'widgetcreated':
          var app = evt.detail;
          this.runningWidgetsById[evt.detail.instanceID] = app;
          break;
        case 'launchwidget':
          instanceID = evt.detail;
          this.display(instanceID);
          break;
        case 'widgetterminated':
          delete this.runningWidgetsById[evt.detail.instanceID];
          break;
      }
    },

    display: function wm_launch(instanceID) {
      var app = this.runningWidgetsById[instanceID];
      if (!app) {
        return;
      }
      app.setVisible(true);
    },

    publish: function wm_publish(event, detail) {
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, true, false, detail);
      window.dispatchEvent(evt);
    }
  };
  exports.WidgetManager = WidgetManager;

}(window));
