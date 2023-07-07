ZoneLayer.js
========================

ZoneLayer.js contains the code for the ZoneLayer class. The ZoneLayer highlights certain areas of the map with colors. These areas are determined by a GeoJSON file. For the most part, ZoneLayer is fairly self-explanatory. During its initialization, it calls a chain of functions that ensure that the necessary data is loaded before rendering. It is also guaranteed to be drawn underneath the TopologyLayer and ContourLayer. The ZoneLayer extends from the Leaflet GeoJSON class.

Important Variables
--------------------

**geojson** : Response 
	The main thing to note with the geojson variable is the fetch command used to initialize it. The URL can be changed in order to use a different zone mapping.

Important Functions
--------------------

**ZoneLayer.style**\ (\ *feature*\ )
	Determines which colors are assigned to what zones based on the GeoJSON data. Adjusting the return values of the switch statement can change the colors of the zones. The cases for the switch statement will most likely have to be changed if a different GeoJSON file is used.

	**Parameters**:
		**feature** : *Object*
			Contains the properties of the GeoJSON file that are used to determine the color of specific zones.