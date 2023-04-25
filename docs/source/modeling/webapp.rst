
Web Application
========================
AGVis is a web application that visualizes the results of a power system simulation.
It leverages the Leaflet library and Python http.server to display the power system
topology and the simulation results. Additional functionality is developed using
JavaScript and Python.

Leaflet
--------------
Leaflet is an open-source JavaScript library for creating interactive maps. It is lightweight,
mobile-friendly, and highly extensible, making it a popular choice for web mapping applications.
With Leaflet, you can easily create maps with various layers, such as tile layers, vector layers,
and marker layers. Additionally, Leaflet supports a wide range of plugins, which provide
extra features like heatmaps, clustering, and drawing tools.

In the context of AGVis, Leaflet is used to render the power system topology on a map,
allowing users to interactively explore the simulation results. Markers and lines represent
different components of the power system, such as substations, transmission lines, and
generators. Users can pan, zoom, and click on individual elements for detailed information.

Python http.server
---------------------------------------------------

Python http.server is a module in Python's standard library that provides classes for implementing
HTTP servers (Web servers). It can be used to serve static files, such as HTML, CSS, and JavaScript,
or to handle dynamic requests through custom request handlers. The http.server module is
particularly useful for quick prototyping and development, as it requires minimal configuration
and can be easily embedded in Python scripts.

In AGVis, Python http.server is employed to serve the web application's static files and handle
HTTP requests. By extending the SimpleHTTPRequestHandler class, custom logic can be added
to process GET and POST requests, enabling seamless communication between the front-end
and back-end components of the application.

JavaScript
-----------------

JavaScript is a versatile, high-level programming language widely used in web development. It allows
developers to create dynamic content and interactive elements for websites and web applications,
enhancing the user experience. With JavaScript, you can manipulate HTML elements, respond to user
input, and communicate with servers to fetch or submit data.

In the AGVis web application, JavaScript plays a crucial role in providing interactivity and additional
functionality. Functions such as timestamp handling and multilayer management are developed using
JavaScript, enabling a more dynamic and responsive user experience.
