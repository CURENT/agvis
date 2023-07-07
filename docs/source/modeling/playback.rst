PlaybackControl.js
========================

PlaybackControl.js contains the code for the PlaybackControl class, also known as the Playback Bar. The Playback Bar handles the UI for the ContourLayer animations. It updates the Window’s timescale when the user changes the animation speed, sets the time when the user restarts or scrubs through the animation, and changes the opacity setting for ContourLayer’s rendering based on the user’s input.

Important Variables
--------------------

**PlaybackControl.win** : Window
	The Window the Playback Bar is associated with.

**PlaybackControl.opacitybar** : HTML Input Element
	The range input for the opacity slider.

**PlaybackControl.playbackbar** : HTML Input Element
	The range input for the Playback Bar.

**paused** : Boolean
	Used by the pause button to determine what state the animation is in.

**playbackspeed** : Number
	The multiplier for how much time passes per timestep. Setting it to 0 pauses the animation.

Important Functions
--------------------

**PlaybackControl.initialize**\ (\ *win*\ , *options*\ )
	Primarily just sets PlaybackControl.win and calls the Leaflet Util initialization function.

	**Parameters**:
		**win** : *Window*
			The primary Window for AGVis.

		**options** : *Object*\ , *optional*
			Passed to the Leaflet initialization function if it is passed from Window.

------------

**PlaybackControl.onAdd**\ (\ *options*\ )
	Adds all the UI elements to the map. Also sets up all of their event functions.
		
	**Parameters**:
		**options** : *Object*\ , *optional*
			Goes completely unused.
			
-------------			
			
**playbackbar.oninput**\ ()
	Updates the Window’s time whenever the user changes the range input.

------------

**pausebutton.onclick**\ ()
	Toggles whether the animation is paused or not. When paused, timescale is set to 0. When not, it is set to whatever timescale the user has selected.

--------------

**stopbutton.onclick**\ ()
	Resets the animation back to the beginning.

-------------

**opacitybar.oninput**\ (\ *e*\ )
	Updates the ContourLayer’s opacity setting based on the user’s input.

	**Parameters**:
		**e** : *Event*
			The Event associated with the input.

------------

**playbackspeedrange.oninput**\ ()
	Updates the Window’s timescale when the user changes the input bar. Also handles adjusting settings when a user selects the custom playback speed option.

------------

**playbackspeedtext.oninput**\ ()
	Sets the Window’s timescale to the value the user input in the text box if the custom playback speed option has been selected.

------------

**PlaybackControl.updatePlaybackBar**\ (\ *value*\ )
	Updates the Playback Bar’s value based on the Window’s current time.

	**Parameters**:	
		**value** : *Number*
			The time passed from the Window.
