'use strict';

(function(exports) {
  var DEBUG = false;

  var WidgetManager = function(app) {
    this.app = app;
    this.runningWidgets = [];
    window.addEventListener('iac-widget', this);
    window.addEventListener('widgetcreated', this);
    window.addEventListener('launchwidget', this);
    window.navigator.mozSetMessageHandler(
      'widget', this.handleEvent.bind(this));
  };

  WidgetManager.prototype = {
    idFormat: 'Widget_',


    draw: function(commands) {
      if (!commands) {
        return;
      }

      var returns = [];
      commands.forEach(function(command) {
        switch (command.action) {
          case 'add':
            var app = widgetFactory.createWidget(command.args.origin,
              command.args.origin + 'manifest.webapp', command.args);
            returns.push({
              requestId: command.requestId,
              action: command.action,
              result: !!app,
              widgetId: app.origin
            });
          break;
          case 'remove':
            this.remove(command.args.widgetId);
            //implement me
            returns.push({});
          break;
          case 'update':
          break;
        }
      }.bind(this));
      return returns;
    },

    getWidget: function(origin) {
      return this.runningWidgets[origin];
    },

    remove: function(widgetId) {
      // Implement me
    },

    handleEvent: function(evt) {
      switch (evt.type) {
        case 'widgetcreated':
          var app = evt.detail;
          this.runningWidgets[evt.detail.origin] = app;
          console.log('widgetcreated');
          break;
        case 'launchwidget':
          var config = evt.detail;
          this.display(config.origin);
          break;
      }
    },

    display: function wm_launch(origin) {
      var app = this.runningWidgets[origin];
      if (!app) {
        return;
      }
      app.open('immediate');
    }
  };
  exports.WidgetManager = WidgetManager;
}(window));
