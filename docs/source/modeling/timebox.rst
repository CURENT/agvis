TimeBox.js
========================

TimeBox.js contains the code the SimTimeBox class, which is extended from a Leaflet Control. The SimTimeBox updates timer in the top left corner of the map when a simulation occurs. It also handles the calculations and checking for the Custom Timestamp feature.

Important Variables
----------------------

**SimTimeBox.simulation_time** : Number
	The current time for the simulation.

**dval2** : String
	The date selected by the user for the Custom Timestamp feature.

**nval2** : String
	The number of increments for the Custom Timestamp feature.

**yval2** : String
	Whether SimTimeBox will try to set a Custom Timestamp or not.

**tval2** : String
	The hour, minute, and second of the day selected by the user for the Custom Timestamp feature.

**msmult** : Number
	The multiple of milliseconds equal to the increment selected by the user.

**ival2** : String
	The size of each increment on the timer.

**ddate** : Date
	The Date determined from the Custom Timestamp settings.

**isostring** : String
	The String used to modify the SimTimeBox’s inner HTML for the Custom Timestamp.

Important Functions
----------------------

**SimTimeBox.onAdd**\ (\ *map*\ )
	Handles adding the SimTimeBox to the map. Sets the initial time and inner HTML.
		
	**Parameters**:
		**map** : *map* *class*
			The map from Window.

--------------

**SimTimeBox.update**\ (\ *t*\ )
	Updates the SimTimeBox based on the time passed by the Window. The time value is taken from the simulation data’s timestep values. Depending on user inputs in the Configuration Settings, it will either just display that time or use it to calculate a Custom Timestamp.

	**Parameters**:
		**t** : *Number*
			The time provided by the Window.
