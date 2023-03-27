# Configuration

All examples on this page will use the same simulation run in the [quick start guide](/quick_start/quick_start).

## Custom Speed and Simulation Playback

Once a simulation has finished running, a playback bar will appear on the bottom left of the window.

<img width="960" alt="speedarrow" src="https://user-images.githubusercontent.com/59810286/171210742-ed48434b-404e-4e6f-97c1-143315cea8ba.png">

Pressing the "**Stop**" button will reset the simulation back to the beginning. Pressing the "**Pause**" button will pause the simulation. Specific times in the simulation can be selected by manually moving the top slider.

The speed at which the simulation plays back can be adjusted as well by moving the bottom slider. A custom speed multiplier can be set by moving the slider all the way to the left.

<img width="369" alt="customespeedbox" src="https://user-images.githubusercontent.com/59810286/171211579-18ac3c40-ec26-4f98-bca8-b585d81a8aaa.png">

## Searching

Clicking on the magnifying glass icon on the top left will open the search function.

<img width="960" alt="searcharrow" src="https://user-images.githubusercontent.com/59810286/171214775-dba0ec90-b436-4e36-9331-a6751e4a54de.png">

Beginning to type in the name of a node from the simulation will bring up a list of the nodes most closely matching your input.

<img width="110" alt="opensearchcrop" src="https://user-images.githubusercontent.com/59810286/171215319-3d3e7217-ae28-4c69-978e-2f937714c8c1.png">

Clicking on one of the options will cause the window to find and zoom in on the chosen node. The window can be zoomed back out using the "**-**" button in the top left. The window can be zoomed in using the "**+**" button above the "**-**" button.

<img width="959" alt="foundgrid" src="https://user-images.githubusercontent.com/59810286/171215418-85684db7-2e45-49eb-9fc5-81c22e32c886.png">

## Adjusting Configuration

Clicking on the cog icon in the sidebar on the right will open the configuration menu.

<img width="960" alt="configarrow" src="https://user-images.githubusercontent.com/59810286/171216489-c095cddf-3646-446a-8dca-13271f5ddecf.png">

The configuration menu is for adjusting a wide variety of things like the hostname and the range of certain variables in the simulation. Configurations you have made can be saved using the "**Save config**" button and can be loaded in another instance with the "**Load config**"" button.

Changing the range of the angle, frequency, and voltage can have substantial effects on the simulation. Here is the simulation at 5.45 seconds with default settings.

<img width="959" alt="confignoton" src="https://user-images.githubusercontent.com/59810286/171219797-5237ef10-8ff1-4a90-94e1-c7dabc7747b2.PNG">

Here is a new configuration for the simulation.

<img width="338" alt="configbox" src="https://user-images.githubusercontent.com/59810286/171220559-d635c486-f330-4b20-9ec7-0600365d2525.png">

And here is the simulation at 5.45 with this change.

<img width="960" alt="configon2" src="https://user-images.githubusercontent.com/59810286/171220730-bab99647-e609-492a-a275-c59c765775bd.PNG">

Needless to say, the change is quite drastic.

## Timestamps

Underneath the configuration settings are the timestamp settings.

<img width="959" alt="timestamp_menu" src="https://user-images.githubusercontent.com/59810286/173458240-2af4d9e4-9a44-4a37-9d98-768421116832.png">

If the timestamp feature is active, the simulation timer in the top right will change based on the inputted time. The timestamp feature can only be activated if all of its inputs are valid. The inputted time should be the time you want the simulation to start at.

### Use Timestamp?

A simple Yes/No toggle for whether you want to use the timestamp feature. If it is set to "**Yes**", it will use the given time, assuming a valid input. If it is set to "**No**", the timer will start at 0 and count up to the length of the simulation in seconds. The default setting is "**No**".

### Select a Date

The input for the starting date of the simulation. Clicking on it will bring up a datepicker. The date can also be typed in using "**mm/dd/yyyy**" format. This input has no default. If you want to use a timestamp, you must choose a date first.

### Select a Time

The input for the starting time of the simulation. Uses "**HH:MM:SS AM/PM**" format. The default setting is "**12:00:00 AM**".

### Select an Increment

A list of the available time increments to use in the simulation. Essentially, each second of the simluation will increment the timer by a certain amount of the specified increment value. The available increments are **Milliseconds**, **Seconds**, **Minutes**, **Hours**, and **Days**. The default increment is **Milliseconds**.

### Number of Increments per Second

The number of time increments you want the timer to advance during a second of the simulation. This can take any non-negative (>= 0), rational number as an input. Decimal inputs work as you might expect: using **1.5 Days**, for example, is equivalent to using **36 Hours**. The default value is **1**. If you put in 0, the timer will simply stay at the selected date and time throughout the entire simulation.

### Update Settings?

A button that will update update the timestamp with your current settings. It will also tell you if there is a problem with your inputted values, but only if *Use Timestamp?* has been set to **Yes**. The timer in the top right will also automatically adjust if a simulation has already been loaded in. If invalid inputs are used when there is already a simulation, the timer will simply revert to the way it is if the timestamp feature is off.

### Timestamp Examples
Here is an example of the timestamp feature being being updated with a valid set of values:

<img width="960" alt="timestamp_validtime" src="https://user-images.githubusercontent.com/59810286/173661002-a60a92bf-6d33-416b-8459-29b6ef05984e.PNG">

Note how the format for a timestamp is **Year-Month-Day Hours-Minutes-Seconds-Milliseconds**. Timestamps use 24-hour time.

Next is an example of the timestamp with a simulation. We'll use the same settings from above:

<img width="960" alt="timestamp_exmid" src="https://user-images.githubusercontent.com/59810286/173662911-47ccc52a-985c-47f6-8f73-e4b17804d545.PNG">

<img width="960" alt="timestamp_exend" src="https://user-images.githubusercontent.com/59810286/173662684-f7e34f85-47c6-4829-8672-02842a9f3f49.PNG">

The first of these two pictures is near the middle of the simulation running. The second is from after the simulation has finished. Given that the timestamp is set to increment 15 minutes per second and that the simulation is exactly 20 seconds long, the simulation should end 5 hours after the starting time, which the second picture shows.

Here is an example of the error message you will receive for trying to update to an invalid set of inputs:

<img width="960" alt="timestamp_badinput" src="https://user-images.githubusercontent.com/59810286/173661556-e9c49434-1fb2-4354-8cf7-a52a8fd8b7e3.PNG">

The error in this case is the negative value for the time increments.
