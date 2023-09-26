ConfigControl.js
========================

ConfigControl.js contains the code for the configuration menu on the sidebar. The configuration menu is used to select the variable to display for the ContourLayer, set up custom Timestamps for the SimTimeBox, change the DiME server settings, toggle minor graphical settings, and save and load configurations and simulations. It should be noted that the saving and loading of configurations and simulations in the configuration menu differs from the functionality of the MultiLayer and IDR.

Important Variables
--------------------

**table_html** : String
	Since most of the UI in the configuration menu is mostly static, it is handled by creating an HTML string containing the inputs.

**DiMEInfo** **class** :
	Contains the info for a DiME server address. Used when changing what DiME server AGVis is connected to.

**SIDEBAR_CALLBACKS** : Array
	An array of functions, though it appears that only updateInputs() is stored in it. Used to re-update information when a configuration file is uploaded.

Important Functions
--------------------

**addSideBarConfig**\ (\ *win*\ , *options*\ , *sidebar*\ )
	Sets up all of the event functions for the UI elements in table_html.

	**Parameters** : 
		**win** : *Window*
			AGVis’s Window.

		**options** : *Object*
			The initial settings for several variables throughout AGVis. Used to preset the input elements.

		**sidebar** : *sidebar* *class*
			The sidebar containing the configuration menu.

--------------

**ts_up.onclick**\ ()
	Verifies the custom Timestamp settings are properly formatted and updates the simTimeBox.
	
-----------	

**updateInputs**\ ()
	Sets all of the values for the inputs based off their values in the options object.

-----------

**Window.dime_updated**\ ()
	Handles setting up a new connection to a DiME Server when a user changes the host or port number.

----------

**opt_amin.oninput**\ ()
	Updates the minimum range for ContourLayer’s voltage angle variable.

-------------

**opt_amax.oninput**\ ()
	Updates the maximum range for ContourLayer’s voltage angle variable.

------------

**opt_vmin.oninput**\()
	Updates the minimum range for ContourLayer’s voltage magnitude variable.

------------

**opt_vmax.oninput**\ ()
	Updates the maximum range for ContourLayer’s voltage magnitude variable.

------------

**opt_fmin.oninput**\ ()
	Updates the minimum range for ContourLayer’s voltage frequency variable.

-----------

**opt_fmax.oninput**\ ()
	Updates the maximum range for ContourLayer’s voltage frequency variable.

-----------

**opt_opacity.oninput**\ ()
	Updates TopologyLayer’s opacity value for drawing lines.

-----------

**opt_togglezones.onclick**\ ()
	Turns on and off the rendering of the ZoneLayer.

-------------

**opt_togglebuslabels.onclick**\ ()
	Turns on and off whether the TopologyLayer includes the node labels.

-----------

**opt_loadconfig_input.onchange**\ ()
	Reads in a JSON file from the user containing configuration settings. This will reset the options object and call updateInputs().

------------

**opt_saveconfig.onclick**\ ()
	Downloads a JSON configuration file from the current settings.

-----------

**opt_loadsimulation_input.onchange**\ ()
	Loads in a reads a simulation file from the user. The Window sets the history and workspace from the file, and then immediately begins and ends a simulation to set up the UI.

-----------

**opt_savesimulation.onclick**\ ()
	Downloads a file containing the information on the workspace and history of the current simulation.
