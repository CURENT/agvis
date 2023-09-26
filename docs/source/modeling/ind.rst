Index.html
========================

Index.html is the landing page for AGVis. When it comes to development, the most important aspects of Index.html are that it loads the various libraries used throughout AGVis and it instantiates the Window class, which is basically the core of AGVis. 

Important Variables
--------------------

**options** : Array of objects
	Contains the setup for each Window.
	
**options.dimehost** : String
	Hostname for the DiME server.

**options.dimeport** : Number
	Port number to connect to the DiME server.
	
**options.vmin** : Number
	Lower bound for the voltage magnitude simulation variable.

**options.vmax** : Number
	Upper bound for the voltage magnitude simulation variable.

**options.amin** : Number
	Lower bound for the voltage angle simulation variable.

**options.amax** : Number
	Upper bound for the voltage angle simulation variable.

**options.fmin** : Number
	Lower bound for the voltage frequency simulation variable.

**options.fmax** : Number
	Upper bound for the voltage frequency simulation variable.

**options.opacity** : Number
	Initial opacity for the lines drawn by the Topology layer.

**window1/window2** : Window class
	The basis for AGVis. Two of them are instantiated due to the limitations on receiving data through DiME. Users have the option to switch to using two windows so that they can run two different simulations at once from DiME and ANDES.
