.. _configuration:

=============
Configuration
=============

AGVis allows user defined configuretaions in the side bars. All examples on this page will use the same
simulation run in the [quick start guide](/quick_start/quick_start).

Custom Speed and Simulation Playback
=======================================

Once a simulation has finished running, a playback bar will appear on the bottom left of the window.

.. image:: /images/config/speedarrow.png
   :alt: speedarrow
   :width: 960px

Pressing the "**Stop**" button will reset the simulation back to the beginning. Pressing the "**Pause**" button will pause the simulation.
Specific times in the simulation can be selected by manually moving the top slider.

The speed at which the simulation plays back can be adjusted as well by moving the bottom slider. A custom speed multiplier can be set by
moving the slider all the way to the left.

.. image:: /images/config/customespeedbox.png
   :alt: customespeedbox
   :width: 369px

Searching
==================

Clicking on the magnifying glass icon on the top left will open the search function.

.. image:: /images/config/searcharrow.png
   :alt: searcharrow
   :width: 960px

Beginning to type in the name of a node from the simulation will bring up a list of the nodes most closely matching your input.

.. image:: /images/config/opensearchcrop.png
   :alt: opensearchcrop
   :width: 110px

Clicking on one of the options will cause the window to find and zoom in on the chosen node. The window can be zoomed back
out using the "**-**" button in the top left. The window can be zoomed in using the "**+**" button above the "**-**" button.

.. image:: /images/config/foundgrid.png
   :alt: foundgrid
   :width: 959px

Adjusting Configuration
==================================

Clicking on the cog icon in the sidebar on the right will open the configuration menu.

.. image:: /images/config/configarrow.png
   :alt: configarrow
   :width: 960px

The configuration menu is for adjusting a wide variety of things like the hostname and the range of certain variables in the simulation.
Configurations you have made can be saved using the "**Save config**" button and can be loaded in another instance with the
"**Load config**"" button.

Changing the range of the angle, frequency, and voltage can have substantial effects on the simulation. Here is the simulation at 5.45
seconds with default settings.

.. image:: /images/config/confignoton.png
   :alt: confignoton
   :width: 959px

Here is a new configuration for the simulation.

.. image:: /images/config/configbox.png
   :alt: configbox
   :width: 338px

And here is the simulation at 5.45 with this change.

.. image:: /images/config/configon2.png
   :alt: configon2
   :width: 960px

Needless to say, the change is quite drastic.

Timestamps
==============================

Underneath the configuration settings are the timestamp settings.

.. image:: /images/config/timestamp_menu.png
   :alt: timestamp_menu
   :width: 959px

If the timestamp feature is active, the simulation timer in the top right will change based on the inputted time. The timestamp feature
can only be activated if all of its inputs are valid. The inputted time should be the time you want the simulation to start at.

Use Timestamp?
-------------------------------------------

A simple Yes/No toggle for whether you want to use the timestamp feature. If it is set to "**Yes**", it will use the given time, assuming
a valid input. If it is set to "**No**", the timer will start at 0 and count up to the length of the simulation in seconds. The default setting is "**No**".

Select a Date
-------------------------------------------

The input for the starting date of the simulation. Clicking on it will bring up a datepicker. The date can also be typed in using
"**mm/dd/yyyy**" format. This input has no default. If you want to use a timestamp, you must choose a date first.

Select a Time
-------------------------------------------

The input for the starting time of the simulation. Uses "**HH:MM:SS AM/PM**" format. The default setting is "**12:00:00 AM**".

Select an Increment
-------------------------------------------

A list of the available time increments to use in the simulation. Essentially, each second of the simluation will increment the timer by a certain
amount of the specified increment value. The available increments are **Milliseconds**, **Seconds**, **Minutes**, **Hours**, and
**Days**. The default increment is **Milliseconds**.

Number of Increments per Second
-------------------------------------------

The number of time increments you want the timer to advance during a second of the simulation. This can take any non-negative (>= 0),
rational number as an input. Decimal inputs work as you might expect: using **1.5 Days**, for example, is equivalent to using **36 Hours**.
The default value is **1**. If you put in 0, the timer will simply stay at the selected date and time throughout the entire simulation.

Update Settings
-------------------------------------------

A button that will update update the timestamp with your current settings. It will also tell you if there is a problem with your inputted values,
but only if *Use Timestamp?* has been set to **Yes**. The timer in the top right will also automatically adjust if a simulation has already been
loaded in. If invalid inputs are used when there is already a simulation, the timer will simply revert to the way it is if the timestamp feature is off.

Timestamp Examples
-------------------------------------------

Here is an example of the timestamp feature being being updated with a valid set of values:

.. image:: /images/config/timestamp_validtime.png
   :alt: timestamp_menu
   :width: 960px

Note how the format for a timestamp is **Year-Month-Day Hours-Minutes-Seconds-Milliseconds**. Timestamps use 24-hour time.

Next is an example of the timestamp with a simulation. We'll use the same settings from above:

.. image:: /images/config/timestamp_exmid.png
   :alt: timestamp_menu
   :width: 960px

.. image:: /images/config/timestamp_exend.png
   :alt: timestamp_menu
   :width: 960px

The first of these two pictures is near the middle of the simulation running. The second is from after the simulation has finished.
Given that the timestamp is set to increment 15 minutes per second and that the simulation is exactly 20 seconds long, the simulation
should end 5 hours after the starting time, which the second picture shows.

Here is an example of the error message you will receive for trying to update to an invalid set of inputs:

.. image:: /images/config/timestamp_badinput.png
   :alt: timestamp_menu
   :width: 960px

The error in this case is the negative value for the time increments.
