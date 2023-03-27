.. _ReleaseNotes:

=============
Release notes
=============

AGVis uses a standard three digit (X.Y.Z) numbering system for versions.
The first number indicates major releases of AGVis, like significant code rewrites and important new features.
The second number is for minor releases, which are primarily just smaller features.
The third number is for revisions--think bug fixes and small changes to UI.

To upgrade AGVis, simply move to its directory and pull the most recent version from Git.


v3.0 Notes
==========

v3.0.0 (2023-XX-XX)
-------------------

The Independent Data Reader Update

- Added in the ability to interpret simulation data and animate it:
  - Playback Bar for playing the animation at different speeds
  - Frequency, Voltage Magnitude, and Voltage Angle displays
  - Customizable ranges for those displays
  - Customizable Timestamps
  - More than one simulation playing at once

v2.0 Notes
==========

v2.1.0 (2023-02-12)
-------------------

- Added a Node size slider in the MultiLayer Menu
- Adjusted zoom granularity for box and pinch zooms
- Minor bug fix for Line thickness slider

v2.0.0 (2022-09-01)
-------------------

The MultiLayer Topology Update

- Added the MultiLayer sidebar and all associated features within it:
  - Excel Reader for displaying Nodes and Lines from properly formatted files
  - Rendering Toggle
  - Custom Node Colors
  - Custom Line Colors
  - Layer Re-ordering
  - Layer Deletion
  - Custom Node Opacity
  - Custom Line Opacity
  - Custom Line Thickness
  - Search Layer Integration
- Added new display symbols for Nodes

Pre-v2.0.0 (2022-08-19)
==============================

Before the release of 2.0.0, AGVis did not have a standardized numbering system for versions.
On account of this and the fact that the primary developer for those pre-2.0.0 versions has moved on to other things,
there is not a good way to label them. Feel free to consider the first version of AGVis that allowed for displaying nodes and simulation data the 1.0.0 version.
The last 1.X.X version would then be the update that added in the Timestamp feature.
