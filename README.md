# Svelte Screen Recording App

I needed a simple screen recording utility for code challenges at interviews.

I've documented the process of creating this application in this blog post:
https://florianschroedl.com/blog/simple-screen-recorder-app

On record it will open a Picture in Picture window with your webcam feed, which you can freely position on your screen while not blocking any content!

The output streams directly to a file on your hard drive via the WebSocket server.

## Setup

To start frontend + backend:

``` bash
npm install
npm run dev
```

