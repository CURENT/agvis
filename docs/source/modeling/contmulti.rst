ContMulti.js
========================

ContMulti.js contains the code relating to the MultiContLayer. Much like how the MultiTopLayer shares many things with the TopologyLayer, the MultiContLayer shares many things with the ContourLayer. Once again, the main difference is that the MultiContLayer uses data from a newlayer as opposed to the Window’s workspace.

Important Variables
--------------------

**MultiContLayer._context** : Object
		The context is just another name for the Window’s workspace.

**MultiContLayer._variableRange** : Object
	Stores the minimum and maximum index for a given variable in “begin” and “end” respectively.

**MultiContLayer._variableRelIndices** : Object
	Stores the ranges for all the variables.

**MultiContLayer._uScaleMin** : Number
	The minimum range for a variable.

**MultiContLayer._uScaleMax** : Number
	The maximum range for a variable.

**MultiContLayer._opacity** : Number
	The opacity for the heatmap. Applied in the fragment shader.

**CountourLayer._cache** : WeakMap
	This caches the information used in the rendering functions.

**MultiContLayer._render** : Boolean
	Determines if the MultiContLayer is rendered or not.

**MultiContLayer._variableName** : String
	The currently active variable for the animations.

**busLatLngCoords** : NDArray class
	Stores the latitude and longitude for each node. Effectively stored as a [# of nodes][2] array, where a node’s latitude is stored as the first element and longitude is stored as the second.

**busPixelCoords** : NDArray class
	Stores the pixel location for each node. Stored in the same manner as busLatLngCoords.

**busTriangles** : NDArray class
	Stores all of the Delaunay triangles. Effectively stored as a [# of triangles][3] array, where each array consists of all the points for a given triangle.

**gl** : WebGL2RenderingContext
	The canvas context used for rendering the MultiContLayer animations.

**programInfo** : ProgramInfo
	A TWGL Object that contains the shaders and context.

**uColormapSampler** : WebGlTexture
	The texture used to create the heatmaps.

Important Functions
--------------------

**MultiContLayer.initialize**\ (options)
	Sets the MultiContLayer’s starting variables.
		
	**Parameters**:
		**options** : *Object*\ , *optional*
			The options Object from Window. Unused beyond being passed to the CanvasLayer initialization function.

-----------------------

**MultiContLayer.update**\ (\ *context*\ )
	Updates the values for the variables and then re-renders the MultiContLayer.
		
	**Parameters**:
		**context** : *Object*
			The workspace from Window.

-------------------

**MultiContLayer.onAdd**\ (\ *map*\ )
	Handles adding the MultiContLayer to the map.
		
	**Parameters**:
		**map** : *map* *class*
			The map from Window.

-----------------

**MultiContLayer.storeRelativeIndices**\ (\ *idx*\ )
	Passes the relative indices for the simulation variables from Window to MultiContLayer.
		
	**Parameters**:
		**idx** : *Object*
			The relative indices.

---------------

**MultiContLayer.showVariable**\ (\ *name*\ )
	Changes the simulation variable being used for the animation and requests that the current frame be redrawn.
		
	**Parameters**:
		**name** : *String*
			The name of the variable used to key into the MultiContLayer._variableRelIndices Object.

---------------------

**MultiContLayer.updateRange**\ (\ *lower*\ , *upper*\ )
	Passes the range values used in the animation from the configuration settings to the MultiContLayer.
		
	**Parameters**:
		**lower** : *Number*
			The lower value for the range.

		**upper** : *Number*
			The upper value for the range.
			
----------------

**MultiContLayer.toggleRender**\ ()
	The function that switches the state of MultiContLayer._render.
	
---------------

**MultiContLayer.updateOpacity**\ (\ *opacity*\ ) 
	Updates the opacity value of MultiContLayer using the value passed from the Playback Bar.
		
	**Parameters**:
		**opacity** : *Number*
			The value taken from the Playback Bar.
	
------------------
	
**MultiTopLayer.stealVals**\ (\ *oldlayer*\ )
	Changes the newlayer’s current values to be those from another newlayer. Used exclusively for the “Prioritize Layer” button.
		
	**Parameters**:
		**oldlayer** : *Object*
			The newlayer that the values are being taken from.

-----------
	
**MultiContLayer.RenderContour**\ (\ *canvas*\ , {\ *size*\ , *bounds*\ , *project*\ , *needsProjectUpdate*\ })
	Handles rendering for the MultiContLayer. Most of the function is determining locations of the nodes if they aren’t in the cache yet, creating all the triangles, and then setting up WebGl with TWGL. A gradient texture is applied to each fragment, which is rendered on the canvas. The color of each fragment is based off the variable data from known locations. Any major modifications to MultiContLayer’s rendering function are probably best left to those with a decent level of familiarity with WebGL.

	**Parameters**:
		**canvas** : *HTML* *Canvas* *Element*
			The canvas that the layer will be drawn on.
			
		**size** : *Point* *class*
			Represents the current size of the map in pixels. All variables included in the object passed to MultiContLayer.RenderTopology are the same as those mentioned in the CanvasLayer’s description. 

		**bounds** : *LatLngBounds* *class*
			Represents the geographical bounds of the map.
 
		**project** : *Function*
			The latLngToContainerPoint function specifically for CanvasLayer._map. 

		**needsProjectionUpdate** : *Boolean*
			Determines whether the Layer’s projection needs to be updated. 
		 
