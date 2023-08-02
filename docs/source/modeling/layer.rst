LayerControl.js
========================

LayerControl.js contains the code for the “Add Layers” menu, which handles the data parsing, variable management, and UI for the IDR and MultiLayer functionality. Effectively, LayerControl.js contains the dynamic equivalent of Window.js, ControlLayer.js, and SimTimeBox.js. This partially explains why it is one of the largest files currently in AGVis. LayerControl uses both the `Papa Parse <https://www.papaparse.com>`_ library and the `SheetJs <https://docs.sheetjs.com/>`_  library for file reading.

Important Variables
----------------------

**newlayer** : Object
	Ordinarily, I would list the variables roughly in order of appearance in the file, but newlayer is large enough and important enough to warrant bending that rule a bit. The newlayer Object is basically a Window. It contains all the data for a power system necessary to display a Topology-type Layer and Contour-type Layer. These take the form of a MultiTopLayer and MultiContLayer. Every time a user uploads a file using the “Add Layer” button, a new newlayer is created and added to the Window’s multilayer array.

**newlayer.data** : Object
	All the data read from the user’s file. Tends to be keyed on sheet name and then column name. The exception to this is when reading the simulation timestep data.

**newlayer.sim** : Boolean
	Whether or not the user included the data needed to create an animation with a MultiContLayer.

**newlayer.preset** : Boolean
	Whether or not the user included configuration presets in the file for the simulation.
	
**newlayer.options** : Object
	The same variables as the Window options, just specific to each newlayer.
	
**newlayer.time** : Number
	The newlayer’s current simulation time.
	
**newlayer.timescale** : Number
	How far the newlayer’s time progress during each step.
	
**newlayer.endtime** : Number
	The final timestep of the simulation.
	
**newlayer.start_time** : Number
	The initial timestep of the simulation.
	
**newlayer.s_show** : String
	Preset for what variable type is shown during the animation. Anything with newlayer.s\_\* is used just for presets.
	
**newlayer.s_tstamp** : Boolean 
	Preset for whether to use the custom Timestamp feature.
	
**newlayer.s_tdate** : String
	Preset for the date used in the custom Timestamp.
	
**newlayer.s_ttime** : String
	Preset for the time used in the custom Timestamp.
	
**newlayer.s_tinc** : String
	Preset for what time value to increment by for the custom Timestamp.

**newlayer.s_tnum** : Number
	Preset for how many of each increment to increase by during each step for the custom Timestamp.

**newlayer.s_string** : String
	String representing the preset for the increment value. Goes unused.
	
**newlayer.name** : String
	The name of the first file uploaded for that specific newlayer. Used in the UI.
	
**newlayer.num** : Number
	A unique identifier for each newlayer. Used to determine where the newlayer is in the Window.multilayer array. Applied to every interactable UI element for the newlayer so that it can be extracted and used to retrieve the newlayer.
	
**newlayer.topo** : MultiTopLayer class
	A Topology-type Layer for the newlayer. Handles displaying the nodes and lines, along with their customization options.
	
**newlayer.cont** : MultiContLayer class
	A Contour-type Layer for the newlayer. Handles displaying the simulation animations.
	
**newlayer.pbar** : PlayMulti class
	The Playback Bar for the newlayer. Handles the simulation timer control UI.
	
**layers_html** : String
	The HTML for the initial state of the “Add Layers” menu.
	
**data** : Array
	All the data for a given sheet as a 2D array.
	
**dlength** : Number
	The number of timesteps in the simulation plus one.

**busnum** : Number
	The number of nodes in the simulation data. Determined by finding the maximum amount of data points for the three simulation variables. Used when reading simulation data from the ANDES output format.

**vnum**\ , **anum**\ , **fnum** : Number
	The amount of nodes for a given simulation variable. Typically associated with Voltage Magnitude, Angle, and Frequency.

**tstart** : Number
	The index for the timestep column in the data array. 
	
**vstart**\ , **astart**\ , **fstart** : Number
	The index for the first column pertaining to a given simulation variable.
	
**elem** : HTML Division Element
	Contains the input elements for MultiLayer and IDR. 
	
**cid**\ , **bid** : String
	The newlayer number extracted from an element’s id.

**cnum**\ , **bnum** : Number
	The Number version of cid and bid.
	
**clayer**\ , **blayer** : newlayer
	The newlayer found with bnum or cnum.
	
**ext** : String
	The extension of an uploaded file. Used to determine how a file should be interpreted.
	
**reader** : FileReader
	The FileReader for the “Add Layer” button. Reads XLSX as binary and CSV as text.
	
**nBus** : Number
	The number of nodes for each simulation variable.
	
**variableRelIndices** : Object
	The relative indices for the three simulation variables if they were stored continuously in an array. Used for the initial setup of the MultiContLayer.

Important Functions
--------------------

**transpose**\ (\ *a*\ )
	Transposes an array. Primarily used to switch data around after reading it.

	**Parameters**:
		**a** : *Array*
			The array to transpose.

-------------	
	
**readAndParse**\ (\ *dat*\ , *ext*\ , *newlayer*\ , *win*\ , *options*\ , *sidebar*\ )
	Interprets and parses the file data. If the data is XLSX, it first uses SheetJs to convert it to CSV. Then, regardless of file type, it passes the CSV data to Papa Parse to convert it to a 2D array. Lastly, it transposes the rows and columns for ease of use. It can read two different formats: AGVis history and ANDES output. CSV files are always assumed to be simulation timestep data since they cannot have sheets.
	
	For the AGVis history format, AGVis first reads the top left cell to retrieve the number of nodes in the data. It then reads the second column to get all the timesteps and takes note of how many of them there are. It then stores each row of variable data points for each timestep.
	
	For the ANDEs output format, AGVis first run through the 2D array to find the time data and the columns associated with each of the three simulation variables. Since the number of columns correlates to the number of nodes, it then determines which variable had the most columns. For each timestep, AGVis creates an array for each simulation variable. Arrays with lengths shorter than the total number of nodes are padded with 0’s until they are the same length. Lastly, the arrays are concatenated together.
	
	If the data is XLSX, AGVis uses sheet names to determine how to format the data. If a sheet is named “O_His” then it is assumed to be the simulation timestep data. AGVis will then determine what format to use and parse the data. If the sheet is named “S_Set”, it is assumed to be presets for the simulations. These are interpreted by simply matching the column names with a preset and then setting the variable. For all other sheets, AGVis will create an Object in newlayer.data keyed on the sheet name. This Object will contain more Objects keyed on each column name. These Objects contain the corresponding column’s data as an array. Once all sheets have been read, the newlayer is assigned a number and name, and it is then stored in Window.multilayer.
	
	If the data is CSV, AGVis will just determine the simulation data format and read it in the same manner as if it was an “O_His” sheet in an XLSX file.
		
	**Parameters**:
		**dat** : *String*
			The data read from the file either as text or a binary string.

		**ext** : *String*
			The file extension. Used to determine how the file should be read.

		**newlayer** : *Object*
			The current newlayer. Once the data is parsed, it is stored in the newlayer.

		**win** : *Window*
			The AGvis Window. Stores each newlayer in Window.multilayer.
			
		**options** : *Object*
			The Window’s options variable. Goes unused.
			
		**sidebar** : *sidebar* *class*
			The Window’s sidebar. Goes unused.

------------

**setupLayer**\ (\ *newlayer*\ , *win*\ , *options*\ , *sidebar*\ )
	Adds in the UI elements for the new newlayer. Most of the function is assigning event functions to various elements. MultiLayer UI elements are always added, but IDR elements are only added if there is simulation data included in the files uploaded by the user. setupLayer() also creates the MultiTopLayer and MultiContLayer for the newlayer.
		
	**Parameters**:		
		**newlayer** : *Object*
			The newlayer. This function assigns it its MultiTopLayer and MultiContLayer. newlayer.num is used extensively for assigning elements ids.
			
		**win** : *Window* *class*
			The AGVis Window. Primarily used to retrieve a specific newlayer during an event function. Also frees up the space in Window.multilayer when a newlayer is deleted.
			
		**options** : *Object*
			The Window’s options. Passed to the newlayer’s PlayMulti.
			
		**sidebar** : *sidebar* *class*
			The sidebar. Goes unused.

---------------

**cbox.onchange**\ ()
	Toggles the rendering for a newlayer’s MultiTopLayer.

------------

**dbutton.onclick**\ ()
	Deletes the newlayer it is associated with. Turns off the rendering for both the newlayer’s MultiTopLayer and MultiContLayer, and removes it from Window.multilayer. Also removes it from the SearchLayer and removes its UI elements.

--------------

**ctog2.onchange**\ ()
	Toggles whether to use custom node colors for a newlayer.

-------------

**ctog3.onchange**\ ()
	Toggles whether to use custom line colors for a newlayer.

-----------

**pbut.onclick**\ ()
	Sets a newlayer’s MultiTopLayer and MultiContLayer to be rendered above all the others. This is done by creating a new newlayer, copying over all the data and settings from the old one, and then deleting the old one.

------------

**color1.onchange**\ ()
	Prompts the user to select a color for a newlayer’s nodes.

-----------

**color2.onchange**\ ()
	Prompts the user to select a color for a newlayer’s lines.

-----------

**range1.onchange**\ ()
	Updates the node opacity for a newlayer along with the UI.

------------

**range2.onchange**\ ()	
	Updates the line opacity for a newlayer along with the UI.

-------------

**range3.onchange**\ ()
	Updates the line thickness for a newlayer along with the UI.
	
------------	
	
**range4.onchange**\ ()
	Updates the node size for a newlayer along with the UI.	

------------

**fbut.onchange**\ ()
	Updates the displayed simulation variable to be Voltage Frequency, or whatever values have been put in place of Voltage Frequency. Also updates the heatmap ranges to those corresponding with Voltage Frequency.

------------

**vbut.onchange**\ ()
	Updates the displayed simulation variable to be Voltage Magnitude, or whatever values have been put in place of Voltage Magnitude. Also updates the heatmap ranges to those corresponding with Voltage Magnitude.

------------

**tbut.onchange**\ ()
	Updates the displayed simulation variable to be Voltage Angle, or whatever values have been put in place of Voltage Angle. Also updates the heatmap ranges to those corresponding with Voltage Angle.
	
-------------	
	
**sinput1.oninput**\ ()
	Updates the minimum range variable for Voltage Frequency in the newlayer. Also updates ranges in the newlayer’s MultiContLayer if Voltage Frequency is the currently shown variable.

-----------

**sinput2.oninput**\ ()
	Updates the maximum range variable for Voltage Frequency in the newlayer. Also updates ranges in the newlayer’s MultiContLayer if Voltage Frequency is the currently shown variable.

-------------

**sinput3.oninput**\ ()
	Updates the minimum range variable for Voltage Magnitude in the newlayer. Also updates ranges in the newlayer’s MultiContLayer if Voltage Magnitude is the currently shown variable.
	
-----------	
	
**sinput4.oninput**\ ()
	Updates the maximum range variable for Voltage Magnitude in the newlayer. Also updates ranges in the newlayer’s MultiContLayer if Voltage Magnitude is the currently shown variable.

------------

**sinput5.oninput**\ ()
	Updates the minimum range variable for Voltage Angle in the newlayer. Also updates ranges in the newlayer’s MultiContLayer if Voltage Angle is the currently shown variable.

------------

**sinput6.oninput**\ ()
	Updates the maximum range variable for Voltage Angle in the newlayer. Also updates ranges in the newlayer’s MultiContLayer if Voltage Angle is the currently shown variable.

------------

**sselect1.onchange**\ ()
	Updates the text in the newlayer’s Custom Timestamp UI when a new increment type is selected. As a side note, most of the UI elements for the newlayer Custom Timestamp features do not have event functions because their values are simply checked by the PlayMulti.

------------

**stepRead**\ (\ *addlayer*\ , *newlayer*\ , *win*\ , *options*\ , *sidebar*\ )
	Sequentially reads through each file uploaded by the user. Requires that the readAndParse() call for a specific file finishes before stepRead() can be called again on the next file. Calls setupLayer() once all files have been read. Also determines the file extension type.
		
	**Parameters**:
		**addlayer** : *Array*
			The files uploaded by the user.
			
		**newlayer** : *Object*
			The newlayer associated with the uploaded files.
			
		**win** : *Window* *class*
			The AGVis Window. Passed to *readAndParse*\ () and *setupLayer*\ ().
			
		**options** : *Object*
			The Window’s options variable. Passed to *readAndParse*\ () and *setupLayer*\ ().

		**sidebar** : *sidebar* *class*
			The sidebar containing the “Add Layers” menu. Passed to *readAndParse*\ () and *setupLayer*\ ().

------------

**startMultiSim**\ (\ *newlayer*\ )
	Does some initial setup for letting a MultiContLayer display a simulation animation. Called in tandem with *endMultiSim*\ ().

	**Parameters**:
		**newlayer** : *Object*
			The newlayer containing the MultiContLayer that needs to start its simulation.

----------

**endMultiSim**\ (\ *newlayer*\ , *win*\ )
	Turns on the display for a MultiContLayer and requests it to draw its current frame.
		
	**Parameters**:
		**newlayer** : *Object*
			The newlayer containing the MultiContLayer that needs to display its simulation.
			
		**win** : *Window* *class*
			AGVis’s Window. Passed to the function for updating the MultiContLayer.

-----------

**addSidebarLayers**\ (\ *win*\ , *options*\ , *sidebar*\ )
	Adds the “Add Layers” menu and sets up the “Add Layer” button.
		
	**Parameters**:
		**win** : *Window* *class*
			AGVis’s Window. Passed to *stepRead*\ () when files are uploaded.
			
	**options** : *Object*
			The Window’s options variable. Passed to *stepRead*\ () when files are uploaded.
			
	**sidebar** : *sidebar* *class*
			Adds the “Add Layers” menu to its display. Passed to stepRead() when files are uploaded.

-----------

**opt_addlayer_input.onchange**\ ()
	Upon a user uploading a file, creates a newlayer, sets its initial values, and calls *stepRead*\ () on the files.
