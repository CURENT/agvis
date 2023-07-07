The Basics
========================

AGVis is a web application written almost exclusively in JavaScript. This means that users need some method of hosting AGVis’s webpage in order to work with it. There are, of course, many options to do this, but one that we suggest is using Python’s built-in **http.server** command, since it allows for a very quick way to test developer builds. AGVis works with major browsers like Firefox, Chrome, Edge, and Safari.

Being a web program, AGVis utilizes a few libraries to aid in its functionality. The main library used throughout the program is Leaflet, which handles displaying the map and various layers that AGVis uses for animating simulation data. Users who want to develop for AGVis should be prepared to reference Leaflet’s documentation frequently, which can be found `here <https://leafletjs.com/reference.html>`_. AGVis also utilizes a few more libraries, like Papa Parse, SheetJs, and TWGL. These additional libraries will be explicitly mentioned when they are used and relevant to development.
