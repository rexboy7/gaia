/* global AppWindow */
'use strict';

/**
 * This is fired when the app window is instantiated.
 * @event WidgetWindow#widgetcreated
 */
(function(exports) {
  var _id = 0;
  var DEBUG = false;


  var WidgetWindow = function WidgetWindow(configuration, containerElement) {
    this.containerElement = containerElement;
    this.reConfig(configuration);
    this.render();
    this.publish('created');
    if (DEBUG || this._DEBUG) {
      AppWindow[this.instanceID] = this;
    }

    this.launchTime = Date.now();

    return this;
  };

  WidgetWindow.prototype = {
//    __proto__: AppWindow.prototype,

    SUB_COMPONENTS: {},

    eventPrefix: 'widget',

    CLASS_NAME: 'WidgetWindow',

    CLASS_LIST: 'widgetWindow',

    setStyle: function(arg) {
      this.width = arg.w || this.width;
      this.height = arg.h || this.height;
      this.left = arg.x || this.left;
      this.top = arg.y || this.top;
      this.opacity = arg.opacity || this.opacity;
      this.element.style.width = this.width + 'px';
      this.element.style.height = this.height + 'px';
      this.element.style.left = this.left + 'px';
      this.element.style.top = this.top + 'px';
      this.element.style.opacity = this.opacity;
    },

    resize: function() {},
    isActive: function() {
      // Widgets never goes active.
      return false;
    },


    // Methods came from original app_window.js in system app
    installSubComponents: function() {
      this.debug('installing sub components...');
      for (var componentName in this.constructor.SUB_COMPONENTS) {
        if (this.constructor.SUB_COMPONENTS[componentName]) {
          this[componentName] =
            new this.constructor.SUB_COMPONENTS[componentName](this);
        }
      }
      if (this.config.chrome &&
          (this.config.chrome.navigation ||
           this.config.chrome.rocketbar)) {
        this.appChrome = new self.AppChrome(this);
      }
    },

    uninstallSubComponents: function() {
      for (var componentName in this.constructor.prototype.SUB_COMPONENTS) {
        if (this[componentName]) {
          this[componentName].destroy();
          this[componentName] = null;
        }
      }

      if (this.config.chrome) {
        this.appChrome.destroy();
        this.appChrome = null;
      }
    },

    /**
     * Render the mozbrowser iframe and some overlays.
     * @inner
     */
    _render: function() {
      if (this.element) {
        return;
      }
      /**
       * Fired before this element is appended to the DOM tree.
       * @event AppWindow#appwillrender
       */
      this.publish('willrender');
      this.containerElement.insertAdjacentHTML('beforeend', this.view());
      // window.open would offer the iframe so we don't need to generate.
      if (this.iframe) {
        this.browser = {
          element: this.iframe
        };
      } else {
        this.browser = new self.BrowserFrame(this.browser_config);
      }
      this.element = document.getElementById(this.instanceID);

      // For gaiauitest usage.
      this.element.dataset.manifestName = this.manifest ? this.manifest.name : '';

      // XXX: Remove following two lines once mozbrowser element is moved
      // into appWindow.
      this.frame = this.element;
      this.iframe = this.browser.element;
      this.iframe.dataset.frameType = 'window';
      this.iframe.dataset.frameOrigin = this.origin;
      this.iframe.dataset.url = this.config.url;

      this.element.appendChild(this.browser.element);
      this.screenshotOverlay = this.element.querySelector('.screenshot-overlay');
      this.fadeOverlay = this.element.querySelector('.fade-overlay');

      var overlay = '.identification-overlay';
      this.identificationOverlay = this.element.querySelector(overlay);
      var icon = '.identification-overlay .icon';
      this.identificationIcon = this.element.querySelector(icon);
      var title = '.identification-overlay .title';
      this.identificationTitle = this.element.querySelector(title);

      // Launched as background: set visibility and overlay screenshot.
      if (this.config.stayBackground) {
        this.setVisible(false);
      }

      /**
       * Fired after the app window element is appended to the DOM tree.
       * @event AppWindow#apprendered
       */
      this.publish('rendered');
      this._rendered = true;
    },

    render: function() {
      this._render();
      this.installSubComponents();
      // Pre determine the rotation degree.
    },

    view: function() {
      return '<div class=" ' + this.CLASS_LIST +
              ' " id="' + this.instanceID +
              '">' +
                '<div class="screenshot-overlay">' +
                '</div>' +
                '<div class="identification-overlay">' +
                  '<div>' +
                    '<div class="icon"></div>' +
                    '<span class="title"></span>' +
                  '</div>' +
                '</div>' +
                '<div class="fade-overlay"></div>' +
             '</div>';
    },
    /**
     * Generate all configurations we need.
     * @param  {Object} configuration Initial configuration object
     *  Includes manifestURL, manifest, url, origin, name.
     */
    reConfig: function(configuration) {
      // Some modules are querying appWindow.manifestURL or appWindow.origin
      // so we inject all configurations into appWindow first.
      for (var key in configuration) {
        this[key] = configuration[key];
      }

      this.browser_config = configuration;
      // Store initial configuration in this.config
      this.config = configuration;
      this.config.chrome = (this.manifest && this.manifest.chrome) ?
        this.manifest.chrome :
        this.config.chrome;

      if (!this.manifestURL && !this.config.chrome) {
        this.config.chrome = {
          navigation: true
        };
      }

      if (!this.manifest && this.config && this.config.title) {
        this.updateName(this.config.title);
      } else {
        this.name = new self.ManifestHelper(this.manifest).name;
      }

      this.generateID();
    },

    generateID: function() {
      if (!this.instanceID) {
        this.instanceID = this.CLASS_NAME + '_' + _id;
        _id++;
      }
    },

    setVisible: function(visible, screenshotIfInvisible) {
      if (this.browser && this.browser.element &&
          'setVisible' in this.browser.element) {
        this.debug('setVisible on browser element:' + visible);
        this.browser.element.setVisible(visible);
      }
    },
    /**
     * Destroy the instance.
     * @fires AppWindow#appdestroyed
     */
    destroy: function() {
      /**
       * Fired before the instance id destroyed.
       * @event AppWindow#appwilldestroy
       */
      this.publish('willdestroy');
      this.uninstallSubComponents();
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
        this.element = null;
      }

      /**
       * Fired after the instance id destroyed.
       * @event AppWindow#appdestroyed
       */
      this.publish('destroyed');
    },
    publish: function(event, detail) {
      var evt = new CustomEvent(this.eventPrefix + event,
                  {
                    bubbles: true,
                    detail: detail || this
                  });

      this.debug(' publishing external event: ' + event);

      // Publish external event.
      window.dispatchEvent(evt);
    },
    debug: function(msg) {
      if (DEBUG || this._DEBUG) {
        console.log('[Dump: ' + this.CLASS_NAME + ']' +
          '[' + (this.name || this.origin) + ']' +
          '[' + this.instanceID + ']' +
          '[' + self.System.currentTime() + ']' +
          Array.slice(arguments).concat());
      }
    }
  };

  exports.WidgetWindow = WidgetWindow;
}(window));

