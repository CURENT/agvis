The Basics
========================

AGVis is a web application written almost exclusively in JavaScript and uses the Python back-end framework Flask. This means that users need some method of hosting AGVis’s webpage in order to work with it. It is recommended to use the web server gateway interface (WSGI) Gunicorn to host it. Any other Flask compatible WSGI will work. AGVis works with major browsers like Firefox, Chrome, Edge, and Safari.

Being a web program, AGVis utilizes a few libraries to aid in its functionality. The main library used throughout the program is Leaflet, which handles displaying the map and various layers that AGVis uses for animating simulation data. Users who want to develop for AGVis should be prepared to reference Leaflet’s documentation frequently, which can be found `here <https://leafletjs.com/reference.html>`_. AGVis also utilizes a few more libraries, like Papa Parse, SheetJs, and TWGL. These additional libraries will be explicitly mentioned when they are used and relevant to development.
