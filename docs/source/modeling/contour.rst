ContourLayer.js
========================

ContourLayer.js contains the code for the ContourLayer class. This class handles displaying the heatmap animations for a given power system. The heatmap bounds are done using the `Delaunay Triangulation <https://d3js.org/d3-delaunay>`_ implementation from the D3.js library. The actual visuals for each heatmap are done using `TWGL <https://twgljs.org/>`_ to apply a texture to each triangle’s fragments based on their interpolated values. 

Important Variables
--------------------

**contourVertexShader** : String
	The vertex shader for the Contour-type Layers. Passes the values for a given variable to the fragment shader so that they can be interpolated for rendering the heat map.

**contourFragmentShader** : String
	The fragment shader for the Contour-type Layers. Maps the color in a texture to each fragment based on the interpolated variable value, the minimum of the variable range, and the maximum of the variable range.

**ContourLayer._context** : Object
	The context is just another name for the Window’s workspace.
	
**ContourLayer._variableRange** : Object
	Stores the minimum and maximum index for a given variable in “begin” and “end” respectively.

**ContourLayer._variableRelIndices** : Object
	Stores the ranges for all the variables.

**ContourLayer._uScaleMin** : Number
	The minimum range for a variable.

**ContourLayer._uScaleMax** : Number
	The maximum range for a variable.

**ContourLayer._opacity** : Number
	The opacity for the heatmap. Applied in the fragment shader.

**CountourLayer._cache** : WeakMap
	Caches the information used in the rendering functions.

**ContourLayer._render** : Boolean
	Determines if the ContourLayer is rendered or not.

**ContourLayer._variableName** : String
	The currently active variable for the animations.

**busLatLngCoords** : NDArray class
	Stores the latitude and longitude for each node. Effectively stored as a [# of nodes][2] array, where a node’s latitude is stored as the first element and longitude is stored as the second.

**busPixelCoords** : NDArray class
	Stores the pixel location for each node. Stored in the same manner as busLatLngCoords.

**busTriangles** : NDArray class
	Stores all of the Delaunay triangles. Effectively stored as a [# of triangles][3] array, where each array consists of all the points for a given triangle.

**gl** : WebGL2RenderingContext
	The canvas context used for rendering the ContourLayer animations.

**programInfo** : ProgramInfo
	A TWGL object that contains the shaders and context.

**uColormapSampler** : WebGlTexture
	The texture used to create the heatmaps.

Important Functions
--------------------

**ContourLayer.initialize**\ (\ *options*\ )
	Sets the ContourLayer’s starting variables.
	
	**Parameters**:
		**options** : *Object*\ , *optional*
			The options Object from Window. Unused beyond being passed to CanvasLayer's initialization function, seemed to be initially used to set certain variables, but those values are instead hardcoded into the initialization.

-----------------

**ContourLayer.update**\ (\ *context*\ )
	Updates the values for the variables and then re-renders the ContourLayer.
	
	**Parameters**:
		**context** : *Object*
			The workspace from Window.

-----------------

**ContourLayer.onAdd**\ (\ *map*\ )
	Handles adding the ContourLayer to the map.
	
	**Parameters**:
		**map** : *map* *class*
			The map from Window.

------------------

**ContourLayer.storeRelativeIndices**\ (\ *idx*\ )
	Passes the relative indices for the simulation variables from Window to ContourLayer.
	
	**Parameters**:
		**idx** : *Object*
			The relative indices.

------------------

**ContourLayer.showVariable**\ (\ *name*\ )
	Changes the simulation variable being used for the animation and requests that the current frame be redrawn.
	
	**Parameters**:
		**name** : *String*
			The name of the variable used to key into the ContourLayer._variableRelIndices Object.

-------------------

**ContourLayer.updateRange**\ (\ *lower*\ , *upper*\ )
	Passes the range values used in the animation from the configuration settings to the ContourLayer.

	**Parameters**:
		**lower** : *Number*
			The lower value for the range.

		**upper** : *Number*
			The upper value for the range.

--------------

**ContourLayer.toggleRender**\ ()
	The function that switches the state of ContourLayer._render.

--------------------

**ContourLayer.updateOpacity**\ (\ *opacity*\ ) 
	Updates the opacity value of ContourLayer using the value passed from the Playback Bar.

	**Parameters**:
		**opacity** : *Number*
		The value taken from the Playback Bar.

-------------------

**ContourLayer.RenderContour**\ (\ *canvas*\ , {\ *size*\ , *bounds*\ , *project*\ , *needsProjectUpdate*\ })
	Handles rendering for the ContourLayer. Most of the function consists of determining locations of the nodes if they aren’t in the cache yet, creating all the triangles, and then setting up WebGL with TWGL. A gradient texture is applied to each fragment, which is rendered on the canvas. The color of each fragment is based off the variable data from known locations. Any major modifications to ContourLayer’s rendering function are probably best left to those with a decent level of familiarity with WebGL.

	**Parameters**:
		**canvas** : *HTML* *Canvas* *Element*
			The canvas that the layer will be drawn on.

		**size** : *Point* *class*
			Represents the current size of the map in pixels. All variables included in the object passed to ContourLayer.RenderTopology are the same as those mentioned in the CanvasLayer’s description.

		**bounds** : *LatLngBounds* *class*
			Represents the geographical bounds of the map.

		**project** : *Function*
			The latLngToContainerPoint function specifically for CanvasLayer._map.

		**needsProjectionUpdate** : *Boolean*
			Determines whether the Layer’s projection needs to be updated. 

