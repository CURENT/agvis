CommunicationLayer.js
========================

CommunicationLayer.js contains the code for the CommunicationLayer class. This Layer goes entirely unused. It appears that it was originally going to draw substantially more lines between points compared to the TopologyLayer. The color and curve of these lines would be determined by devices associated with the nodes and their capacities for transferring and receiving data. 

Important Variables
-----------------------

**CommunicationLayer._context** : Object
	The Window’s workspace.

**CommunicationLayer._cache** : WeakMap
	Caches the data for different device types from the context.

**CommunicationLayer._render** : Boolean
	Determines whether the CommunicationLayer will be displayed.

**paramCache** : Object
	Caches the locations for the various devices in the CommunciationLayer.

**varCache** : Object
	Caches which devices send and which ones receive, along with how much data was transferred between them.

**pdcPixelCoords** : NDArray class
	Stores the location of each PDC device. Effectively stored as a [# of PDC devices][2] array, where for each array the first index contains the latitude of the device and the second contains the longitude.

**pmuPixelCoords** : NDArray class
	Stores the location of each PMU device. Effectively stored as a [# of PMU devices][2] array, where for each array the first index contains the latitude of the device and the second contains the longitude.

**switchPixelCoords** : NDArray class
	Stores the location of each Switch device. Effectively stored as a [# of Switch devices][2] array, where for each array the first index contains the latitude of the device and the second contains the longitude.

**linkPixelCoords** : NDArray class
	Stores the connections between the various devices. Effectively stored as a [# of  links][4] array, where for each array the first index contains the latitude of the first device, the second index contains the longitude of the first device, the third index contains the latitude of the second device, and the fourth index contains the longitude of the second device.

**transferBytesPerNode** : Object
	Keeps track of the location and transfer amount of each node that sends data. Keyed on a string with the format “DeviceType,Index”.

**receiveBytesPerNode** : Object
	Keeps track of the location and transfer amount of each node that receives data. Keyed on a string with the format “DeviceType,Index”.
		
**transferPixelCoords** : NDArray class
	Stores the data transfers between the various devices. Effectively stored as a [# of  transfers][4] array, where for each array the first index contains the latitude of the sending device, the second index contains the longitude of the sending device, the third index contains the latitude of the receiving device, and the fourth index contains the longitude of the receiving device.
	
**ctx** : CanvasRenderingContext2D
	The canvas context used to render the communication lines.
	
Important Functions
--------------------
 
**CommunicationLayer.initialize**\ (\ *options*\ )
	Sets the CommunicationLayer’s starting variables.
		
	**Parameters**:
		**options** : *Object*
			The options object from Window. Unused beyond being passed to the CanvasLayer’s initialization function.

---------------

**CommunicationLayer.update**\ (\ *context*\ )
	Updates the values for the devices and then re-renders the CommunicationLayer.

	**Parameters**:
		**context** : *Object*
			The workspace from Window.

-----------

**CommunicationLayer.onAdd**\ (\ *map*\ )
	Handles adding the CommunicationLayer to the map.

	**Parameters**:
		**map** : *map* *class*
			The map from Window.

-------------

**CommunicationLayer.toggleRender**\ ()
	Switches the state of CommunicationLayer._render.

--------------

**CommunicationLayer.RenderCommunication**\ (\ *canvas*\ , {\ *size*\ , *bounds*\ , *project*\ , *needsProjectUpdate*\ })
	Renders for the CommunicationLayer. It primarily establishes lookup variables for device locations, device links, and data transfers. After setting up the variables, the Canvas Context draws lines between each set of linked devices. If then draws gradient lines between devices that transfer data, with the gradient indicating which node is the sending node and which is the receiving node. Lastly, it draws circles at the location of each device, with the color being determined by the device type.

	**Parameters**:
		**canvas** : *HTML* *Canvas* *Element*
			The canvas that the layer will be drawn on.

		**size** : *Point* *class*
			Represents the current size of the map in pixels. All variables included in the object passed to CommunicationLayer.RenderCommunication are the same as those mentioned in the CanvasLayer’s description.
 
		**bounds** : *LatLngBounds* *class*
			Represents the geographical bounds of the map.
 
		**project** : *Function*
			The latLngToContainerPoint function specifically for CanvasLayer._map.
 
		**needsProjectionUpdate** : *Boolean*
			Determines whether the Layer’s projection needs to be updated. 

