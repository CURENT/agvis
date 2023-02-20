# Independent Data Reader

The Independent Data Reader is an extension of the MultiLayer functionality, allowing AGVis to interpet and animate simulation data provided by users in an Excel file. The features relating to the Independent Data Reader are appended to the MultiLayer features if a file is compatible with the IDR. It is also found in menu with the **+/-** icon.

![addlayericon](https://user-images.githubusercontent.com/59810286/220143360-257ab116-5ff9-4582-ac38-2f8ecd3c255e.png)

## Add Layer

When you open up the MultiLayer menu, you will only see the **Add Layer** button.

![addlayerbutton](https://user-images.githubusercontent.com/59810286/220143425-93d58747-bcf7-496c-b32e-1cb4f2acb933.png)

When you click on it, it will request an Excel file. ***The IDR requires an additional sheet, O_His, along with the Bus and Line sheets required for MultiLayer.*** 

### O_His

The O_His sheet stores the simulation data for three variables, Frequency, Voltage Magnitude (also referred to simpy as Voltage), and Voltage Angle (also referred to as Theta). It expects 2 + (# of buses * 3) columns. Every row after the first row, is the data for a given time. The first row is a label row, while the first column is an index column. The first row of the first column must be the number of buses in the simulation. The second column, labeled "t", contains the timesteps of the simulation. The (# of buses * 3) columns after the first two consist of the data for each bus for each variable at a given time. The first *n* columns (where n is the # of buses) after the time column contain data for the Voltage Magnitude. The second *n* columns contain data for the Voltage Angle. The third *n* columns contain data for the Frequency. 

Theoretically, each *n* columns for Frequency, Voltage Magnitude, and Voltage Angle could be replaced with *n* worth of different simulation data. These variables are simply the ones used originally with AGVis, and thus are used in the current version.

### Optional S_Set

The S_Set sheet is a completely optional sheet that allows users to preset certain configuration options. S_Set expects these columns: show, freq, v_mag, v_ang, tstamp, tdae, ttime, tinc, and tnum. The show column is where you specify which variable, Frequency, Voltage Magnitude or Voltage Angle, you would like the animation to show. It expects **f** (Frequency), **v** (Voltage Magnitude), or **t** (Voltage Angle). The freq, v_mag, and v_ang columns are used to set the range for those variables. The minimum should be set in the first cell underneath the column label, and the maximum should be set in the second cell underneath the label. tstamp indicates if you would like to use the custom Timestamp feature. It expects **yes** or **no**. tdate sets the date you would like to use with the Timestamp. The date should be formatted as **YYYY-MM-DD**. time, similarly sets the hours, minutes, and seconds for the Timestamp. It uses 24-hour time formatted as **HH:MM:SS**. tinc is the time increment you would like the timer step in. It expects **Milliseconds**, **Seconds**, **Minutes**, **Hours**, or **Days**. tnum is how many of that increment you would like to timer to increase by in a given second. It expects a **positive integer or decimal**.
 
Here is an edited version of the wecc.xlsx file from the AGVis cases directory on GitHub with simulation data included: [sim_example.xlsx](https://github.com/CURENT/agvis/files/10785612/sim_example.xlsx)



## IDR Options

After uploading a valid Excel sheet, the MultiLayer menu will fill with both the MultiLayer options and the IDR options:

![idr](https://user-images.githubusercontent.com/59810286/220143884-2d9b7b10-86c9-42b2-b5af-092272a6477d.png)

### Playback Bar

Once the file has finished uploading, the Playback Bar will appear underneath the Node settings.

![playback1](https://user-images.githubusercontent.com/59810286/220143948-ea92fb17-4c04-4049-bba5-c817cecc9615.png)

Pressing the "**Restart**" button will reset the simulation back to the beginning. Pressing the "**Pause**" button will pause the simulation. Specific times in the simulation can be selected by manually moving the top slider.

The speed at which the simulation plays back can be adjusted as well by moving the bottom slider. A custom speed multiplier can be set by moving the slider all the way to the left.

![playback2](https://user-images.githubusercontent.com/59810286/220143984-9d644619-530c-4be4-8885-f30095191437.png)

### Shown Variable

Underneath the Playback Bar are the shown variable buttons. These buttons determine what set of data is used for the simulation animation. The **Frequency** button is clicked by defaut.

![vset](https://user-images.githubusercontent.com/59810286/220144051-2f5ec712-3284-454c-a28c-92ffe52b6ce9.png)

### Variable Range

The ranges underneath the shown variable buttons and timer are for adjusting the heat mapping for the simulation. The default for Frequency is **0.9998 - 1.0002**. The default for Voltage Magnitutde is **0.8 - 1.2**. The default for Voltage Angle is **-1 - 1**.

Here are before and after shots for each variable:

**Frequency**

![freq1](https://user-images.githubusercontent.com/59810286/220144107-59c90394-2a54-45ab-9494-126b8f3fd3fb.PNG)

![freq2](https://user-images.githubusercontent.com/59810286/220144129-f9460590-5ee6-4d8a-9678-241817219b6e.PNG)

**Voltage Magnitude**

![volt1](https://user-images.githubusercontent.com/59810286/220144169-59c76235-42a1-40b0-b9f3-42d14fd6c637.PNG)

![volt2](https://user-images.githubusercontent.com/59810286/220144203-84f449bb-542c-4075-bec6-35ea0083424f.PNG)

**Voltage Angle**

![thet1](https://user-images.githubusercontent.com/59810286/220144234-09ec6d84-d37d-430c-ba16-5815b7d9ce7d.PNG)

![the2](https://user-images.githubusercontent.com/59810286/220144261-2ed48733-7e22-4dbc-b6b7-05caf77e2351.PNG)

### Timer

The timer is underneath the shown variable buttons. It updates according to the length of the simulation. By default it counts up from the minimum time given in the data, but it can be adjusted using the Timestamp settings.

![timer](https://user-images.githubusercontent.com/59810286/220144310-7f936d4e-82db-40b9-b884-986d32e66341.png)

## Timestamps

Underneath the Node and Configuration settings are the Timestamp settings.

![timestamp1](https://user-images.githubusercontent.com/59810286/220144348-6d868bee-9092-4ac6-bf34-185dcc4fe3ca.png)

If the timestamp feature is active, the simulation timer under the variable ranges will change to reflect the settings. The timestamp feature can only be activated if all of its inputs are valid. The inputted time should be the time you want the simulation to start at.

### Use Timestamp?

A simple Yes/No toggle for whether you want to use the timestamp feature. If it is clicked, it will use the given time, assuming a valid input. If it is set to unclicked, the timer will start at 0 and count up to the length of the simulation in seconds. The default setting is "**unclicked**".

### Select a Date

The input for the starting date of the simulation. Clicking on it will bring up a datepicker. The date can also be typed in using "**MM/DD/YYYY**" format. This input has no default. If you want to use a timestamp, you must choose a date first.

### Select a Time

The input for the starting time of the simulation. Uses "**HH:MM:SS AM/PM**" format. The default setting is "**12:00:00 AM**".

### Select an Increment

A list of the available time increments to use in the simulation. Essentially, each second of the simluation will increment the timer by a certain amount of the specified increment value. The available increments are **Milliseconds**, **Seconds**, **Minutes**, **Hours**, and **Days**. The default increment is **Milliseconds**.

### Number of **Increments** per Second

The number of time increments you want the timer to advance during a second of the simulation. This can take any non-negative (>= 0), rational number as an input. Decimal inputs work as you might expect: using **1.5 Days**, for example, is equivalent to using **36 Hours**. The default value is **1**. If you put in 0, the timer will simply stay at the selected date and time throughout the entire simulation.

![timestamp2](https://user-images.githubusercontent.com/59810286/220144385-2baead4c-a471-4bd2-89b8-d16f68ab2b9b.PNG)

