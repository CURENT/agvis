CanvasLayer.js
========================

CanvasLayer.js contains the code for the CanvasLayer class. The CanvasLayer is an intermediary class, extending from Leaflet’s Layer class and being extended from by most of the other Layer-type classes in AGVis. It contains basic functions for handling things like rendering, removing, and adding Layers.

Important Variables
---------------------

**CanvasLayer._map** : map class
	The Leaflet map passed from the Window.

**CanvasLayer._canvas** : HTML Canvas Element
	The canvas that the layer will be drawn on.

**CanvasLayer._needsProjectionUpdate** : Boolean
	Determines whether the Layer’s projection needs to be updated. Passed to the rendering functions for TopologyLayer and ContourLayer, along with their MultiLayer counterparts.

**size** : Point class
	Represents the current size of the map in pixels. Passed to the rendering functions for TopologyLayer and ContourLayer, along with their MultiLayer counterparts.

**bounds** : LatLngBounds class
	Represents the geographical bounds of the map. Passed to the rendering functions for TopologyLayer and ContourLayer, along with their MultiLayer counterparts.

**project** : Function
	The latLngToContainerPoint function specifically for CanvasLayer._map. Passed to the rendering functions for TopologyLayer and ContourLayer, along with their MultiLayer counterparts.

Important Functions
--------------------

**CanvasLayer.onAdd**\ (\ *map*\ )
	Sets up the canvas Element and establishes how resizing works for the Layer.

	**Parameters**:
		**map** : *map* *class*
			The map passed by Window.

------------

**CanvasLayer._reset**\ ()
	Initially starts drawing the Layer. Sets the position of the canvas and requests a projection update.

----------------

**CanvasLayer._redraw**\ ()
	Calls the rendering function for a given Layer if it has one. Sets up the variables mentioned above that are passed to the Topology-type and Contour-type Layers.

