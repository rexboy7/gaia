var PresentationClient = {
  init: function pc_init() {
    // Presenter side:
    // PostMessage(to "system app")
    // add event listener on response
    // make Offer SDP
    // set local SDP
    // send SDP through system app, 'onpresentoffer'
    // add "onpresentanswer" from system app
    // got SDP from "onpresentanswer" event
    // ===========================
    // Server side:
    // add event listener for "onpresentoffer"
    // on "onpresentoffer", send SDP to client
    // add "onpresentanswer" event
    // pass SDP to presenter by "onpresentanswer"
    // ===========================
    // Client side:
    // add event listener for "onpresentoffer"
    // on "onpresentoffer", set remote SDP
    // make Answer SDP
    // send SDP to Server side, "onpresentanswer"
  },
}

PresentationClient.init();