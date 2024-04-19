index.html
========================

``index.html`` is the HTML file for the CURENT LTBWeb application.

Head Section
--------------------

The head section of the HTML file contains the title of the page and various styles and scripts used throughout the application. Notable styles include settings for map display and Vega-Embed links spacing. The scripts include dependencies such as Leaflet, Vega, and others used for map rendering and data visualization.

Body Section
--------------------

The body section of the HTML file contains two main divisions (`map1` and `map2`) for displaying maps. Additionally, there are JavaScript scripts embedded within the HTML to configure map settings and initialize map objects.

JavaScript Configuration
--------------------

The JavaScript section sets up options for the maps, including host, port, minimum and maximum values for various parameters, and opacity settings. It also handles cookies and URL hash parsing for map configurations. Two map windows (`window1` and `window2`) are created based on the provided options.

The `toggleSecondMap()` function toggles the visibility of the second map (`map2`). An easy button is added to the first map (`map1`) to enable this toggling functionality.

Finally, if the number of map views (`nview`) is greater than 1, the second map is toggled to be initially visible.
