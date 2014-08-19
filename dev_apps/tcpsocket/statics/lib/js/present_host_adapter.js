var PresentHostAdapter = {
  __proto__: PureHTTPPeer,
  init: function() {
    PureHTTPPeer.init.apply(this);
    window.addEventListener("message", this.handleWindowEvent.bind(this));
  },
  presentWindows: {},
  //onDataChannelOpened: function pha_onDataChannelOpened() {

  //}
  handleWindowEvent: function pha_handleWindowEvent(evt) {
    switch(evt.type) {
      case 'message':
        var message = evt.data;
        switch(message.event) {
          case 'presentoffer':
            //  @event presentoffer : {
            //    event: 'presentoffer'
            //    data: offer SDP from presenter
            //    url: URL/id of presenter
            //  }
            PresentHostAdapter.dataChannelSend('presentoffer', message.data, message.id);
            break;
        }
        break;
    }
  },
  onDataChannelReceive: function pha_onDataChannelReceive(message) {
    console.log("UA is " + PresentHostAdapter.rank);
    console.log("host adapter event received:" + message.event);
    switch(message.event) {
      case 'opensession':
        // @event opensession: {
        //   event: 'opensession',
        //   data: [  URL for window to be opened]
        // }
        this.presentWindows[message.data] = new PresentWindow(message.data);
        break;
      case 'presentanswer':
        //  @event presentanswer: {
        //    event: 'presentanswer'
        //    data: answer SDP from remote client side
        //    id: URL/id of presenter
        //  }
        //  Just transfer it to presentWindow
        this.presentWindows[message.id]._handleMessage({data: message});
        break;
    }
  }

};

function PresentWindow(url) {
  // TODO: open window by OOP.
  this.frame = document.createElement('iframe');
  this.id = url;
  this.frame.src = url;
  document.body.appendChild(this.frame);
  // @event initpresent: {
  //   event: 'initpresent',
  //   data: URL for window to be opened
  // }
  console.log(this.frame);
  this.frame.onload = function() {
    this.frame.contentWindow.postMessage({event: 'initpresent', id: this.id}, '*');
  }.bind(this);

}

PresentWindow.prototype = {
  _handleMessage: function ps_handleMessage(evt) {
  var message = evt.data;
  if (!message) {
    return;
  }
    switch(message.event) {

    case 'presentanswer':
      this.frame.contentWindow.postMessage({
          event: 'presentanswer',
          data: message.data,
          id: message.id}, '*');
      break;
    };
  },
}

PresentHostAdapter.init();
