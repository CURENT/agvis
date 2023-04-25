.. _idr:

==========================
MultiLayer
==========================

The MultiLayer functionality of AGVis allows users to upload files on their computer to
render nodes, lines, and (soon) previous simulation data without having to use ANDES or
DiME. These features are currently contained within the menu on the side bar with
the **+/-** icon.

.. image:: /images/idr/addlayericon.png
   :alt: addlayericon
   :width: 960px

Add Layer
===============

When you open up the MultiLayer menu, you will only see the **Add Layer** button.

.. image:: /images/multi/addlayer.png
   :alt: addlayer
   :width: 960px

When you click on it, it will request an Excel file.
***For the MultiLayer features towork properly, your Excel must contain two specific, properly formatted sheets: Bus and Line.***
You are free to include other sheets in it as well, but those two are necessary.

Bus
-----------------

The Bus sheet contains the information on the nodes you want to render. It is called "Bus" as a
holdover from when AGVis exclusively rendered power systems. There are three required columns
in Bus--idx, xcoord, and ycoord. idx is a number ID for each node. xcoord and ycoord are the
longitude and latitude of the node, respctively.

There are also some optional columns that add additonal information rendering nodes--name,
type, and color. The name column can contain a name for a node. It is used in the search function.
The type column can assign a node with a specific type, giving it a unique icon when it's rendered.
A table containing the types and associated icons can be found at the bottom of this page. The color
column can be used to specify a custom color for the nodes without using the interface shown later.
It should only have one hexadecimal color value (**#@@@@@@**) in the first cell of the column.

Line
----------------------------

The Line sheet contains information on the lines connecting the nodes to each other. There are also
three required columns--idx, bus1, and bus2. idx, once again, is an ID for each line. bus1 represents
the "from" node. bus2 represents the "to" node. The Line sheet also has the optional name and color
columns. As in the Bus sheet, the name column contains names for each Line. The color column should
have one hexadecimal color value (**#@@@@@@**) in the first cell of the column.
 
Here is an example Excel file with the required and optional columns filled out:
[example.xlsx](https://github.com/CURENT/agvis/files/9473935/example.xlsx)


MultiLayer Options
==================

After uploading a valid Excel sheet, the MultiLayer menu will fill with the name of the file and options
for how to display the it:

.. image:: /images/multi/newlayer.png
   :alt: newlayer
   :width: 960px

Toggle Rendering
----------------------------

Toggles whether the nodes and buses of that specific file are shown on the map. It's default state is
**off**.

.. image:: /images/multi/newlayer2.png
   :alt: newlayer2
   :width: 960px

Custom Colors
----------------------------

The *Toggle Custom Node Colors* and *Toggle Custom Line Colors* turn on or off whether to use
the values from the *Custom Node Color* and *Custom Line Color* settings when rendering. Both of
the toggles are **off** by default. *Custom Node Color* is white (#FFFFFF) by default and
*Custom Line Color* is black (#000000) by default. The toggles will turn on and the custom color
settings will be set upon upload if the file has specified color columns.

.. image:: /images/multi/customcolor.png
   :alt: customcolor
   :width: 960px

Opacity Settings
----------------------------

The *Node Opacity* and *Line Opacity* settings are fairly self-explanatory. They are used to adjust
the opacities of the nodes and lines. *Node Opacity* defaults to **100** and *Line Opacity*
defaults to **50**. 

.. image:: /images/multi/low_node_opacity.png
   :alt: low_node_opacity
   :width: 960px

.. image:: /images/multi/high_line_opacity.png
   :alt: high_node_opacity
   :width: 960px

Size Settings
----------------------------

*Line Thickness* is used to adjust the thickness of the lines connecting nodes. It defaults to **2**,
has a minimum of **1**, and has a maximum of **7**. *Node Size* is used to adjust the size of
the nodes. It defaults to **12**, has a minimum of **4**, and has a maximum of **36**.

Here are before and after shots for each variable:

.. image:: /images/multi/bignodebigline.png
   :alt: bignodebigline
   :width: 960px

Prioritize Layer
----------------------------

Given that the MultiLayer implementation is meant to display more than one set of nodes and lines
at a time, it is possible that two different layers will have some overlap. The *Prioritize Layer* button
will give a layer rendering priority over the others, meaning that it will be drawn over all the others.
Here is an image of two layers that overlap:

.. image:: /images/multi/priority1.png
   :alt: priority1
   :width: 960px

Note that the "ieee39" layer is drawn over the "npcc" layer. Now here is another image of these two
layers after pressing the *Prioritize Layer* button for "necc":

.. image:: /images/multi/priority2.png
   :alt: priority2
   :width: 960px

Now the "npcc" nodes and lines are drawn over the "ieee39" ones.

Delete Layer
----------------------------

Deletes a layer, removing it from the menu and from the map.

Having gone through all the MultiLayer options, here is what the example Excel file looks like rendered
(with adjustments to node size and line opacity for clarity):

.. image:: /images/multi/exampleupload.png
   :alt: exampleupload
   :width: 960px

Custom Node Icons
----------------------------

The type column in the Bus sheet uses a keyword system to assign custom icons to nodes. If the type
cell for a node is not empty, it checks for the first keyword it can find, regardless of context. If you put
"This is not a compressor" in a node's type cell, that node will be given the compressor icon. Key words
are *not* case sensitive.

======================== ======================== ==================================
Icon Type                Keyword                  Icon Description
======================== ======================== ==================================
Gas Well                 ``well``                 White node with large W in center
Gas Compressor           ``compressor``           Gray Trapezoid
Load Bus                 ``load``                 Yellow Triangle
Power-to-Gas             ``ptg``                  Green node with "PG" in center
Gas Power Plant          ``gfg``                  Blue node with "GG" in center
======================== ======================== ==================================


If you would like to request a custom icon, please do so on the AGVis GitHub. When you make a request,
please include the keyword for icon, a reference or desciption of it, and what the icon is meant to represent.