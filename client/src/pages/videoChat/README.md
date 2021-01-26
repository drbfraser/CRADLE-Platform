The video chat feature routed user's video/audio through a demo server that we do not control. This was a security risk. As such, the feature has been disabled pending a rewrite.

The previous version used the following packages (removed from `package.json` as they are no longer needed):
```
"rtcmulticonnection": "3.7.0",
"socket.io": "2.3.0",
"sweetalert": "2.1.2",
```