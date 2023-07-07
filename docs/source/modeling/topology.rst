TopologyLayer.js
========================

TopologyLayer.js contains the code the TopologyLayer class. The ToplogyLayer handles displaying the nodes (buses) and lines for a given power system. 

Important Variables
--------------------

**TopologyLayer._context** : Object
	The context is just another name for the Window’s workspace.

**TopologyLayer._cache** : WeakMap
	Caches the information needed to determine which buses are specific types so that those buses can be given special icons. This primarily goes unused.

**TopologyLayer._render** : Boolean
	Determines if the TopologyLayer is displayed.

**TopologyLayer._render_bus_ids** : Boolean
	Determines if the Bus IDs are rendered along with the buses. This is primarily for debugging purposes.

**TopologyLayer._opacity** : Number
	The opacity setting for the lines drawn between the buses.
 
**TopologyLayer._images** : Object
	Contains the icons for the various types of nodes.

**busLatLngCoords** : NDArray class
	Stores the latitude and longitude for each node. Effectively stored as a [# of nodes][2] array, where a node’s latitude is stored as the first element and longitude is stored as the second.

**busPixelCoords** : NDArray class
	Stores the pixel location for each node. Stored in the same manner as busLatLngCoords.

**busToIndexLookup** : Map
	Maps a node’s ID value to the index it appears at within the data.
 
**busToImageLookup** : Map
	Maps node numbers to specific image types from TopologyLayer._images based on the typing of the node that the number corresponds to.

**ctx** : CanvasRenderingContext2D
	The Canvas Context used to render the node icons and connecting lines.

Important Functions
--------------------

**TopologyLayer.initialize**\ (\ *options*\ )
	Sets the TopologyLayer’s starting variables.
		
	**Parameters**:
		**options** : *Object*\ , *optional*
			The options Object from Window. Unused beyond being passed to the CanvasLayer's initialization function, seemed to be initially used to set certain variables, but those values are instead hardcoded into the initialization.

-----------------

**TopologyLayer.update**\ (\ *context*\ )
	Updates the values for the nodes and lines and then re-renders the TopologyLayer.

	**Parameters**:
		**context** : *Object*
			The workspace from Window.

------------------

**TopologyLayer.onAdd**\ (\ *map*\ )
	Handles adding the TopologyLayer to the map.

	**Parameters**:
		**map** : *map* *class*
			The map from Window.
	
-------------------

**TopologyLayer.toggleRender**\ ()
	Switches the state of TopologyLayer._render.

------------------

**TopologyLayer.RenderTopology**\ (\ *canvas*\ , {\ *size*\ , *bounds*\ , *project*\ , *needsProjectUpdate*\ })
	Renders for the TopologyLayer. It establishes many lookup variables for specific node types, but these go unused for the most part. Lines are drawn between node locations by the Canvas Context. Nodes are placed after the lines are drawn, and their icons depend on their associated image in busToImageLookup. Lines and nodes are drawn in order of appearance in the data.

	**Parameters**:
		**canvas** : *HTML* *Canvas* *Element*
			The canvas that the layer will be drawn on.

		**size** : *Point* *class*
			Represents the current size of the map in pixels. All variables included in the object passed to TopologyLayer.RenderTopology are the same as those mentioned in the CanvasLayer’s description.

		**bounds** : *LatLngBounds* *class*
			Represents the geographical bounds of the map.

		**project** : *Function*
			The latLngToContainerPoint function specifically for CanvasLayer._map.

		**needsProjectionUpdate** : *Boolean*
			Boolean that determines whether the Layer’s projection needs to be updated. 

