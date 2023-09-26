Window.js
========================

Window.js contains the code for the Window class. Windows basically run the entirety of AGVis. They handle timing for the animations and receiving data from DiME. They also instantiate most of the Layers and UI elements used for displaying data. Developers that want to add new features to AGVis will inevitably have to either interface with a Window directly or with one of its components.

Important Variables
--------------------

**Window.workspace** : Object
	Contains the data for each variable in a simulation for the current timestep. Passed to the various layers when updating them.
	
**Window.history** : Object
	Contains the data for each variable in the simulation for every timestep. Used for replaying animations.
	
**Window.multilayer** : Array of Objects
	An array of newlayer Objects. It contains the data necessary for displaying simulations added by file upload.

**Window.mlayercur** : Number
	The index of an available space in Window.multilayer. Used when creating a newlayer.

**Window.mnumfree** : Number
	The number of open spaces in Window.multilayer. Used when creating a newlayer.

**Window.time** : Number
	The current time of the animation.

**Window.end_time** : Number
	The stop time for a simulation.

**Window.timescale** : Number
	The multiplier for the animation speed.

**dt** : Number
	Stores how much time has passed between two timesteps.

**TILE_LAYER_URL** : String
	The URL to load the TileLayer’s image from.

**Window.map** : map class
	A Leaflet map. Initialized with zoom and center settings.

**Window.pbar** :  PlaybackControl class
	The Playback Bar that appears on the bottom left after receiving data from DiME.

**Window.tileLayer** : TileLayer class
	Displays the base image of the map.

**Window.zoneLayer** : ZoneLayer class
	Highlights specific zones on the map with various colors.

**Window.topologyLayer** : TopologyLayer class
	Displays the node and line information received from DiME.

**Window.contourLayer** : ContourLayer class
	Displays the animation for the simulation received from DiME.

.. warning::
 Window.contourLayer and Window.topologyLayer are only relevant to simulations received using DiME. They are not used for data uploaded directly by the user for the MultiLayer and IDR features.

**Window.communicationLayer** : CommunicationLayer class
	Currently unused. Displays lines representing communication between various devices.

**Window.searchLayer** : SearchLayer class
	Handles finding and zooming in on named nodes.

**Window.simTimeBox** : SimTimeBox class
	Displays the simulation time in the top right corner for simulations received using DiME.

**sidebar** : sidebar class
	Handles creating the sidebar UI element. From `this <https://github.com/noerw/leaflet-sidebar-v2>`_ Leaflet plugin.

**Window.variableAbsIndices** : Float64Array
	Contains the indices used to get the three simulation variables from the NDArray.

**Window.variableRelIndices** : Object
	Contains the relative indices for the three simulation variables if they were stored continuously in an array. Used when retrieving data for the Contour Layer.

**Window.dimec** : DimeClient class
	The DiME client used for receiving data from the DiME server.


Important Functions
--------------------

**Window.constructor**\ (\ *num*\ , *options*\ , *dimec*\ )
	The constructor for the Window class. Instantiates the layers along with various UI elements. It also begins the timer loop for simulations uploaded by users instead of sent through DiME. Called in index.html. 

	**Parameters**:
		**num** : *Number*
			The unique number given to the Window. Used for naming and accessing specific variables.

		**options** : *Object*
			Contains various settings mentioned in index.html.

		**dimec** : *DimeClient class, optional*
			This goes unused.

---------------

**Window.historyKeeper**\ (\ *varname*\ , *currentTimeInSeconds*\ )
	Retrieves variables from Window.history. It allows playing back simulations to work. It finds the timestep that the current time is closest to, and then sets the requested variable to the value from that timestep.

	**Parameters**:
		**varname** : *String*
			The requested variable.
		
		**currentTimeInSeconds** : *Number*
			How many seconds have passed during the simulation. This value is not affected by using the custom Timestamp feature.

---------------

**Window.startSimulation**\ ()
	Begins the simulation after receiving initial data from DiME. It sets up the three simulation variables along with their array indices. It also sets the initial variable for the Contour Layer and starts its animation.

---------------

**Window.endSimulation**\ ()
	Called once all the simulation data has been received. It sets the end time for the animation and adds the Playback Bar UI element.

---------------

async **Window.drawThread**\ () 
	Creates and calls the *step()* and *reset()* functions and then calls them. The *step()* function, which is passed to *requestAnimationFrame()*\ , finds the difference between the current time and the previous *step()* call’s time and updates the variables and the Layers based on the new time. It also updates the SimTimeBox display. The *reset()* function resets the variable for telling if an animation is starting from the beginning.

--------------

async **Window.mainThread**\ ()
	Adds in a few more UI elements, namely those for changing the displayed simulation variable and for toggling certain layers. It also handles connecting to and receiving data from the DiME server. It calls both *startSimulation()* and *endSimulation()* depending on the inputs it receives from DiME. It is called in index.html after initializing the Window.

--------------

**load**\ (\ *buf*\ )
	Sets the history and workspace when loading a previous simulation from a DiME file upload. Note that this is separate from the MultiLayer and IDR features. The button for this is found in the Configuration menu.

	**Parameters**:
		**buf** : *ArrayBuffer*
			The ArrayBuffer from the file upload.

---------------

**save**\ ()
	Downloads a DiME file of the current simulation. Note that this is separate from the MultiLayer and IDR features.
