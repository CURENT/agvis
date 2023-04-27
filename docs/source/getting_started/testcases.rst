
.. _test-cases:

============
Test Cases
============

AGVis ships with test ANDES cases for visualziation in the ``agvis/cases`` folder.
The cases can be found in the `online repository`_.

.. _`online repository`: https://github.com/CURENT/andes/tree/master/agvis/cases

Summary
=======

Below is a summary of the test cases for visualization.

- ``ieee39``: the IEEE 39-bus test case [IEEE]_.
- ``wecc``: the 179-bus Western Electric Coordinating Council (WECC) test case
  [WECC]_.
- ``npcc``: the 140-bus Northeast Power Coordinating Council (NPCC) test case
  originated from Power System Toolbox [PST]_.
- ``ercot276``: 276-bus of Texas.
- ``ei528``: the CURENT Eastern Interconnection network [EI]_.
- ``ACTIVSg2000``: 2000-bus synthetic grid on footprint of Texas [ACTIVSg2000]_.
- ``maritime_gas``: Example gas network.

.. Note::

    The devices ``BusFreq`` are required in the test case to measure the Bus voltage,
    angle, and frequency.

Topology Gallery
============================

Below, you can see the power grid topologies visualized by AGVis.

IEEE 39-bus
------------------
.. figure:: cases/ieee39.png
   :alt: ieee39
   :width: 960px
   :align: left

WECC 179-bus
------------------
.. figure:: cases/wecc.png
   :alt: wecc
   :width: 960px
   :align: left

NPCC 140-bus
------------------
.. figure:: cases/npcc.png
   :alt: npcc
   :width: 960px
   :align: left

Reduced ERCOT 276-bus
----------------------------------------
.. figure:: cases/ercot276.png
   :alt: ercot276
   :width: 960px
   :align: left

CURENT EI 528-bus
----------------------------------------
.. figure:: cases/ei528.png
   :alt: ei528
   :width: 960px
   :align: left

Texas Synthetic 2000-bus
----------------------------------------
.. figure:: cases/ACTIVSg2000.png
   :alt: ACTIVSg2000
   :width: 960px
   :align: left

How to contribute
=================

We welcome the contribution of test cases! You can make a pull request to
contribute new test cases. Please follow the structure in the ``cases`` folder
and provide a screenshot to showcase your system.

.. [EI]  D. Osipov and M. Arrieta-Paternina, "Reduced Eastern Interconnection
        System Model", [Online]. Available:
.. [ACTIVSg2000]  Texas A&M University, "ACTIVSg2000: 2000-bus synthetic grid on
        footprint of Texas",
        https://electricgrids.engr.tamu.edu/electric-grid-test-cases/activsg2000/
.. [IEEE] University of Washington, "Power Systems Test Case Archive", [Online].
        Available: https://labs.ece.uw.edu/pstca/
.. [WECC] K. Sun, "Test Cases Library of Power System Sustained Oscillations".
       Available: http://web.eecs.utk.edu/~kaisun/Oscillation/basecase.html
.. [PST] Power System Toolbox, [Online]. Available:
        https://sites.ecse.rpi.edu/~chowj/PSTMan.pdf