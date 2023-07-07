TopMulti.js
========================

TopMulti.js contains the code for the MultiTopLayer. You’ll notice many similarities between this code and that of the standard TopologyLayer. This is due to the fact that the MultiTopLayer was built off of the TopologyLayer. The major difference between them is that the MultiTopLayer has more customization features and uses newlayer data as opposed to the Window’s workspace.

Important Variables
---------------------

**MultiTopLayer._context** : Object
	The context is just another name for the Window’s workspace. For the most part, goes unused.

**MultiTopLayer._cache** : WeakMap
	Caches the information needed to determine which buses are specific types so that those buses can be given special icons. This primarily goes unused.

**MultiTopLayer._render** : Boolean
	Determines if the MultiTopLayer is displayed.

**MultiTopLayer._render_bus_ids** : Boolean
	Determines if the Bus IDs are rendered along with the buses. This is primarily for debugging purposes.

**MultiTopLayer._cnode** : Boolean
	Whether to use custom node colors or not.
	
**MultiTopLayer._cline** : Boolean
	Whether to use custom line colors or not.
	
**MultiTopLayer._nr** : Number
	The RGB red value for nodes.
	
**MultiTopLayer._ng** : Number
	The RGB green value for nodes.
	
**MultiTopLayer._nb** : Number
	The RGB blue value for nodes.
	
**MultiTopLayer._lr** : Number
	The RGB red value for lines.
	
**MultiTopLayer._lg** : Number
	The RGB green value for lines.
	
**MultiTopLayer._bg** : Number
	The RGB blue value for lines.
	
**MultiTopLayer._nop** : Number
	The opacity value for nodes.
	
**MultiTopLayer._lop** : Number
	The opacity value for lines.
	
**MultiTopLayer._lthick** : Number
	The thickness value for lines.
	
**MultiTopLayer._nsize** : Number
	The size value for nodes.
	
**MultiTopLayer._newlayer** : Object
	The newlayer associated with the MultiTopLayer.
	
**MultiTopLayer._images** : Object
	Contains the icons for the various types of nodes.
	
**busLatLngCoords** : NDArray class
	Stores the latitude and longitude for each node. Effectively stored as a [# of nodes][2] array, where a node’s latitude is stored as the first element and longitude is stored as the second.
	
**busPixelCoords** : NDArray class
	Stores the pixel location for each node. Stored in the same manner as busLatLngCoords.
	
**busToIndexLookup** : Map
	Maps a node’s ID value to the index it appears at within the data. 
	
**busToImageLookup** : Map
	Maps node numbers to specific image types from MultiTopLayer._images based on the typing of the node that the number corresponds to.
	
**ctx** : CanvasRenderingContext2D
	The Canvas Context used to render the node icons and connecting lines.
	
**ncop** : Number
	The node opacity value applied to a 0-255 scale.
	
**lcop** : Number
	The line opacity value applied to a 0-255 scale.
	
**cimg** : Object
	The ImageData object for the entire canvas. The RGBA data contained within cimg modified when recoloring nodes.

Important Functions
---------------------

**MultiTopLayer.initialize**\ (\ *options*\ )
	Sets the MultiTopLayer’s starting variables.
		
	**Parameters**:
		**options** : *Object*\ , *optional*
			The options object from Window. Unused beyond being passed to the CanvasLayer intialization function. 

--------------

**MultiTopLayer.update**\ (\ *context*\ )
	Updates the values for the nodes and lines and then re-renders the MultiTopLayer.
		
	**Parameters**:
		**context** : *Object*
			The workspace from Window.

--------------

**MultiTopLayer.onAdd**\ (\ *map*\ )
	Handles adding the MultiTopLayer to the map.
		
	**Parameters**:
		**map** : *map* *class*
			The map from Window.

------------

**MultiTopLayer.toggleRender**\ ()
	Switches the state of MultiTopLayer._render.


-----------

**MultiTopLayer.toggleCNode**\ ()
	Switches the state of MultiTopLayer._cnode.

------------

**MultiTopLayer.toggleCLine**\ ()
	Switches the state of MultiTopLayer._cline.

----------

**MultiTopLayer.updateCNVal**\ (\ *cval1*\ )
	Updates the node color values based on user input.
		
	**Parameters**:
		**cval1** : *String*
			The RGB string from the input.

----------

**MultiTopLayer.updateCLVal**\ (\ *cval2*\ )
	Updates the line color values based on user input. Also ensures that the line color does not match specific values needed when recoloring nodes.
		
	**Parameters**:
		**cval2** : *String*
			The RGB string from the input.

----------

**MultiTopLayer.updateNOp**\ (\ *rval1*\ )
	Updates the opacity value for nodes and normalizes it to a 0-1 range.
		
	**Parameters**:
		**rval1** : *Number*
			The value from the range input.

---------

**MultiTopLayer.updateLOp**\ (\ *rval2*\ )
	Updates the opacity value for lines and normalizes it to a 0-1 range.
		
	**Parameters**:
		**rval2** : *Number*
			The value from the range input.

------------

**MultiTopLayer.updateLThick**\ (\ *rval3*\ )
	Updates the thickness value for the lines.
		
	**Parameters**:
		**rval3** : *Number*
			The value from the range input.

----------

**MultiTopLayer.updateNSize**\ (\ *rval4*\ )
	Updates the size value for nodes.
		
	**Parameters**:
		**rval4** : *Number*
			The value from the range input.

------------

**MultiTopLayer.stealVals**\ (\ *oldlayer*\ )
	Changes the newlayer’s current values to be those from another newlayer. Used exclusively for the “Prioritize Layer” button.
		
	**Parameters**:
		**oldlayer** : *Object*
			The newlayer that the values are being taken from.

------------

**MultiTopLayer.RenderTopology**\ (\ *canvas*\ , {\ *size*\ , *bounds*\ , *project*\ , *needsProjectUpdate*\ })
	Renders for the MultiTopLayer. It establishes many lookup variables for specific node types, but these go unused for the most part. Lines are drawn between node locations by the Canvas Context. Line color, width, and opacity is handled by simply modifying strokeStyle and linewidth variables of the Canvas Context. Nodes are placed after the lines are drawn, and their icons depend on their associated image in busToImageLookup. 
	
	Node customization is handled by initially placing the nodes at their user-selected size and then running through the image data to change the RGBA values at node locations. Node locations are determined by finding pixels of pure white and one specific shade of pink associated with the SYN type nodes. These pixels are then recolored. If a user selects a line color that is pure white or that shade of pink, the color is imperceptibly changed to not exactly match that RGB value. This prevents lines from being incorrectly recolored. Lines and nodes are drawn in order of appearance in the data.

	**Parameters**:
		**canvas** : *HTML* *Canvas* *Element*
			The canvas that the layer will be drawn on.

		**size** : *Point* *class*
			Represents the current size of the map in pixels. All variables included in the object passed to MultiTopLayer.RenderTopology are the same as those mentioned in the CanvasLayer’s description. 

		**bounds** : *LatLngBounds* *class*
			Represents the geographical bounds of the map. 

		**project** : *Function*
			The latLngToContainerPoint function specifically for CanvasLayer._map. 

		**needsProjectionUpdate** : *Boolean*
			Determines whether the Layer’s projection needs to be updated. 
