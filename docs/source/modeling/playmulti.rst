PlayMulti.js
========================

PlayMulti.js contains the code for the PlayMulti control, which handles the simulation controls for newlayers. It is mostly the same as the PlaybackControl, though it does also incorporate some aspects from SimTimeBox since the timer for each newlayer is just some updating text as opposed to a full time box.

Important Variables
----------------------

**PlayMulti.newlayer** : Object
	The newlayer associated with the specific Playback Bar.

**PlayMulti.playbackbar** : HTML Input Element
	The range input for the Playback Bar.

**paused** : Boolean
	Used by the pause button to determine what state the animation is in.

**playbackspeed** : Number
	The multiplier for how much time passes per timestep. Setting it to 0 pauses the animation.

**pt** : Number
	The amount the timer increases by for each update call.

**PlayMulti.prev** : Number
	The previous Playback Bar value. Used to check if the timer actually needs to update.

**timerup** : HTML Paragraph Element
	The paragraph that contains the timer text.

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
--------------------

**PlayMulti.initialize**\ (\ *win*\ , *options*\ )
	Primarily just sets PlayMulti.win and calls the Leaflet Util initialization function.
		
	**Parameters**:
		**win** : *Window*
			The primary Window for AGVis.

		**options** : *Object*\ , *optional*
			Passed to the Leaflet initialization function if it is passed from LayerControl.js.

----------

**playbackbar.oninput**\ ()
	Updates the Window’s time whenever the user changes the range input.

-------------

**pausebutton.onclick**\ ()
	Toggles whether the animation is paused or not. When paused, timescale is set to 0. When not, it is set to whatever timescale the user has selected.

-----------

**stopbutton.onclick**\ ()
	Resets the animation back to the beginning.

-----------

**playbackspeedrange.oninput**\ ()
	Updates the Window’s timescale when the user changes the input bar. Also handles adjusting settings when a user selects the custom playback speed option.

----------

**playbackspeedtext.oninput**\ ()
	Sets the Window’s timescale to the value the user input in the text box if the custom playback speed option has been selected.

----------

**PlayMulti.updatePlaybackBar**\ (\ *dt*\ , *timestep*\ )
	Updates the Playback Bar’s value based on the Window’s current time, requests that the MultiContLayer updates, and checks for Custom Timestamp settings.

	**Parameters**:	
		**dt** : *Number*
			The number of seconds between the current update and the most recent update.

		**timestep** : *Number*
			The current time from the Window.
