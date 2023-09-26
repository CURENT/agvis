SearchLayer.js
========================

SearchLayer.js contains the code for the SearchLayer class. Unlike many of the other classes in AGVis, SearchLayer extends from the Leaflet LayerGroup class as opposed to the custom CanvasLayer class. The SearchLayer keeps track of all the nodes for currently rendered Topology-type Layers. It places invisible markers on the location of every node that can be searched by clicking on the magnifying glass icon in the top left of the UI. Upon selecting a searched node, the view will move to the location of that node and zoom in on it. The SearchLayer control that handles this is provided by the `Leaflet Search <https://github.com/stefanocudini/leaflet-search>`_ plugin.

Important Variables
---------------------

**SearchLayer._context** : Object
		The Window’s workspace.

**SearchLayer._cache** : WeakMap
		Caches the data from the context. For the most part it goes unused, though it does see use as one of the methods of checking if markers need to be placed.

**SearchLayer._needs_update** : Boolean
		Set to true when initialized. Another one of the ways the update function checks if markers need to be placed.

**marker** : Marker object
		The two variables named “marker” do the same thing, namely they are added to the SearchLayer so that they can be searched. They contain location and identification data for nodes.
		
Important Functions
--------------------

**SearchLayer.initialize**\ (\ *options*\ )
	Sets the SearchLayer’s starting variables.

	**Parameters**:
		**options** : *Object*\ , *optional*
			The options Object from Window. Unused beyond being passed to the LayerGroup’s initialization function.

--------------

**SearchLayer.update**\ (\ *context*\ , *win*\ )
	Places the markers on the SearchLayer. First it loops through the multilayer Objects to determine whether their MultiTopLayers are rendered. If a MultiTopLayer is not rendered, then its markers will not be added to the SearchLayer. After that it checks if the nodes received through DiME need markers to be added to the SearchLayer. If they do, it adds them and updates appropriate variables accordingly.

	**Parameters**:
		**context** : *Object*
			The workspace from Window.

		**win** : *Window* *class*
			The Window itself. Included in order to access the MultiLayer data.

