# MultiLayer

The MultiLayer functionality of AGVis allows users to upload files on their computer to render nodes, lines, and (soon) previous simulation data without having to use ANDES or DiME. These features are currently contained within the menu on the side bar with the **+/-** icon.

<img width="959" alt="addlayericon" src="https://user-images.githubusercontent.com/59810286/187751811-769a0c89-bc6b-4fed-bda5-1f12b18969d2.PNG">

## Add Layer

When you open up the MultiLayer menu, you will only see the **Add Layer** button.

<img width="960" alt="addlayer" src="https://user-images.githubusercontent.com/59810286/187752548-e2d4ec57-566c-44b8-a70e-1d14ba3d7efb.PNG">

When you click on it, it will request an Excel file. ***For the MultiLayer features to work properly, your Excel must contain two specific, properly formatted sheets: Bus and Line.*** You are free to include other sheets in it as well, but those two are necessary.

### Bus

The Bus sheet contains the information on the nodes you want to render. It is called "Bus" as a holdover from when AGVis exclusively rendered power systems. There are three required columns in Bus--idx, xcoord, and ycoord. idx is a number ID for each node. xcoord and ycoord are the longitude and latitude of the node, respctively.

There are also some optional columns that add additonal information rendering nodes--name, type, and color. The name column can contain a name for a node. It is used in the search function. The type column can assign a node with a specific type, giving it a unique icon when it's rendered. A table containing the types and associated icons can be found at the bottom of this page. The color column can be used to specify a custom color for the nodes without using the interface shown later. It should only have one hexadecimal color value (**#@@@@@@**) in the first cell of the column.

### Line

The Line sheet contains information on the lines connecting the nodes to each other. There are also three required columns--idx, bus1, and bus2. idx, once again, is an ID for each line. bus1 represents the "from" node. bus2 represents the "to" node. The Line sheet also has the optional name and color columns. As in the Bus sheet, the name column contains names for each Line. The color column should have one hexadecimal color value (**#@@@@@@**) in the first cell of the column.
 
Here is an example Excel file with the required and optional columns filled out: ***FILE HERE***

## MultiLayer Options

After uploading a valid Excel sheet, the MultiLayer menu will fill with the name of the file and options for how to display the it:

<img width="960" alt="newlayer" src="https://user-images.githubusercontent.com/59810286/187752307-c740d697-6df8-44ec-aa8a-11f6155d686a.PNG">

### Toggle Rendering

Toggles whether the nodes and buses of that specific file are shown on the map. It's default state is **off**.

<img width="960" alt="newlayer2" src="https://user-images.githubusercontent.com/59810286/187753023-e57a725b-9629-4c23-9489-6c72c3e15810.PNG">

### Custom Colors

The *Toggle Custom Node Colors* and *Toggle Custom Line Colors* turn on or off whether to use the values from the *Custom Node Color* and *Custom Line Color* settings when rendering. Both of the toggles are **off** by default. *Custom Node Color* is white (#FFFFFF) by default and *Custom Line Color* is black (#000000) by default. The toggles will turn on and the custom color settings will be set upon upload if the file has specified color columns.

<img width="960" alt="customcolor" src="https://user-images.githubusercontent.com/59810286/187753056-7303728f-8188-4e38-8ce8-c27ae41e65fd.PNG">

### Opacity Settings

The *Node Opacity* and *Line Opacity* settings are fairly self-explanatory. They are used to adjust the opacities of the nodes and lines. *Node Opacity* defaults to **100** and *Line Opacity* defaults to **50**. 

<img width="960" alt="low node opacity" src="https://user-images.githubusercontent.com/59810286/187753085-5392116b-330e-437b-86ca-eb38f6612949.PNG">

<img width="960" alt="high line opacity" src="https://user-images.githubusercontent.com/59810286/187753115-deace379-70b9-4c8c-b248-ede67906546b.PNG">

### Size Settings

*Line Thickness* is used to adjust the thickness of the lines connecting nodes. It defaults to **2**, has a minimum of **1**, and has a maximum of **7**. *Node Size* is used to adjust the size of the nodes. It defaults to **12**, has a minimum of **4**, and has a maximum of **36**.

<img width="960" alt="bignodebigline" src="https://user-images.githubusercontent.com/59810286/187753147-39fad31f-1e78-458c-8dce-f9ea8320ff5c.PNG">

### Prioritize Layer

Given that the MultiLayer implementation is meant to display more than one set of nodes and lines at a time, it is possible that two different layers will have some overlap. The *Prioritize Layer* button will give a layer rendering priority over the others, meaning that it will be drawn over all the others. Here is an image of two layers that overlap:

<img width="960" alt="priority1" src="https://user-images.githubusercontent.com/59810286/187753192-61ddec3c-dc77-4828-b7f5-01b3598ad1c2.PNG">

Note that the "ieee39" layer is drawn over the "necc" layer. Now here is another image of these two layers after pressing the *Prioritize Layer* button for "necc":

<img width="960" alt="priority2" src="https://user-images.githubusercontent.com/59810286/187753232-c3511a32-80a9-4e48-bdcf-60514bf335e2.PNG">

Now the "necc" nodes and lines are drawn over the "ieee39" ones.

### Delete Layer

Deletes a layer, removing it from the menu and from the map.


Having gone through all the MultiLayer options, here is what the example Excel file looks like rendered (with adjustments to node size and line opacity for clarity):

<img width="960" alt="exampleupload" src="https://user-images.githubusercontent.com/59810286/187753677-5b6da88c-19fa-48e9-a1fe-ef099e45e9cd.PNG">

## Custom Node Icons

The type column in the Bus sheet uses a keyword system to assign custom icons to nodes. If the type cell for a node is not empty, it checks for the first keyword it can find, regardless of context. If you put "This is not a compressor" in a node's type cell, that node will be given the compressor icon. Key words are *not* case sensitive.

| Icon Type               | Keyword                 | Icon Description                  |
| ----------------------- | ----------------------- | --------------------------------- |
| Gas Well                | "well"                  | White node with large W in center |
| Gas Compressor          | "compressor"            | Gray Trapezoid                    |
| Load Bus                | "load                   | Yellow Triangle                   |
| Power-to-Gas            | "ptg"                   | Green node with "PG" in center    |
| Gas Power Plant         | "gfg"                   | Blue node with "GG" in center     |


If you would like to request a custom icon, please do so on the AGVis GitHub. When you make a request, please include the keyword for icon, a reference or desciption of it, and what the icon is meant to represent.
