# Presentation API Polyfill

This is a pure javascript implementation of Presentation API using WebRTC as underlying transferring channel, with an HTTP server for signaling.
Runs on Firefox.

## Requirement

You will need node.js with `express` package to run the signaling server. do:

> npm install express

## Running

1. Run `node.js server/server.js`.
2. On your primary device, use browser to open `http://your.ip.address:8000/primary/0` whereas 0 is the room number that can be specified as arbitirary interger.
3. On your secondary device, use browser to open `http://your.ip.address:8000/secondary_host/0` whereas 0 is the room number specified below.
4. If signaling runs correctly you will see 'screen 0' appears on your primary device. Select it and click 'connect'.
5. An Iframe pops up on your secondary device. You can try type something to chat between the two devices.

## Developing

There are three roles:

   +-----------[Server]----------+
   |                             |
   |                             |
[Primary]                 [Secondary_host]
                                    |
                                    |
                          [Secondary_page]

