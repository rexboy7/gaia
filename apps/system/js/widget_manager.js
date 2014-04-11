/* global widgetFactory, homescreenConnection, HomescreenLauncher */
'use strict';

(function(exports) {

  var WidgetManager = function(app) {
    this.app = app;
    this.runningWidgetsById = {};
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
    receiveOperation: function(commands) {
      if (!commands) {
        return;
      }

      commands.forEach(function(command) {
        var app;
        switch (command.action) {
          case 'add':
            app = widgetFactory.createWidget(command.args);
            homescreenConnection.response(
              !!app,
              command.requestId,
              command.action,
              app.instanceID);
          break;
          case 'remove':
            if (!command.args.widgetId) {
              homescreenConnection.deny(
                command.requestId, command.action, command.args.widgetId);
            }
            homescreenConnection.response(
              this.remove(command.args.widgetId),
              command.requestId,
              command.action,
              command.args.widgetId);
          break;
          case 'update':
            app = this.runningWidgetsById[command.args.widgetId];
            if (!app) {
              homescreenConnection.deny(
                command.requestId, command.action, command.args.widgetId);
              return;
            }
            app.setStyle(command.args);
            homescreenConnection.confirm(
              command.requestId,
              command.action,
              command.args.widgetId);
            break;
          case 'hideall':
            HomescreenLauncher.getHomescreen().hideWidgetLayer();
            homescreenConnection.confirm(command.requestId, command.action);
            break;
          case 'showall':
            HomescreenLauncher.getHomescreen().showWidgetLayer();
            homescreenConnection.confirm(command.requestId, command.action);
            break;
        }
      }.bind(this));
    },

    getWidget: function(widgetId) {
      return this.runningWidgetsById[widgetId];
    },

    remove: function(widgetId) {
      if (this.runningWidgetsById[widgetId]) {
        this.runningWidgetsById[widgetId].kill();
        return true;
      } else {
        return false;
      }
    },

    handleEvent: function(evt) {
      var widgetId;
      switch (evt.type) {
        case 'homescreenopened':
          for (widgetId in this.runningWidgetsById) {
            this.runningWidgetsById[widgetId].setVisible(true);
          }
          break;
        case 'appwillopen':
          for (widgetId in this.runningWidgetsById) {
            this.runningWidgetsById[widgetId].setVisible(false);
          }
          break;
        case 'widgetcreated':
          var app = evt.detail;
          this.runningWidgetsById[evt.detail.instanceID] = app;
          break;
        case 'launchwidget':
          var instanceID = evt.detail;
          this.display(instanceID);
          break;
        case 'homescreen-action-object':
          this.receiveOperation(evt.detail);
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
      app.open('immediate');
    }
  };
  exports.WidgetManager = WidgetManager;

}(window));
