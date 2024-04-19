Legend.js
========================

Creates the class L.DynamicLegend, a draggable legend bar for AGVis simulation data.

Updates based on the current options set in the options menu.


Important Functions
--------------------

**L.DynamicLegend.initialize**\ (win)
    Just sets the initial variable win.

**L.DynamicLegend.onAdd**\ ()
    Sets the stylings and builds the legend div.

**L.DynamicLegend.onDragStart**\ ()
    Sets the legend to draggable.

**L.DynamicLegend.onDrag**\ ()
    Updates the legend's position while mouse is pressed.

**L.DynamicLegend.onDragEnd**\ ()
    Stops the dragging of the legend.

**L.DynamicLegend.update**\ ()
    Updates the legend based on the current options set in the options menu.