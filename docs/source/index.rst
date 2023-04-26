.. AGVis documentation master file, created by
   sphinx-quickstart on Sat Mar 18 21:14:37 2023.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

===================
AGVis documentation
===================

**Useful Links**: `Source Repository`_ | `Report Issues`_
| `Q&A`_ | `LTB Website`_ | `LTB Repository`_

.. _`Source Repository`: https://github.com/CURENT/agvis
.. _`Report Issues`: https://github.com/CURENT/agvis/issues
.. _`Q&A`: https://github.com/CURENT/agvis/discussions
.. _`LTB Website`: https://ltb.curent.org
.. _`LTB Repository`: https://github.com/CURENT
.. _`ANDES`: https://github.com/CURENT/andes
.. _`DiME`: https://github.com/CURENT/dime

.. image:: /images/sponsors/CURENT_Logo_NameOnTrans.png
   :alt: CURENT Logo
   :width: 300px
   :height: 74.2px

AGVis is a web-based open-source tool for geographical visualizations of energy systems.
AGVis is capable of real-time geographical visualization of power systems when coupled
with `ANDES`_ and `DiME`_.
AGVis is currently in active development and a standalone visualization of power systems
using user defined data is currently in the works.

AGVis is the visualization module for the CURENT Largescale Testbed (LTB). More information about
CURENT LTB can be found at the `LTB Repository`_.

.. panels::
    :card: + intro-card text-center
    :column: col-lg-6 col-md-6 col-sm-6 col-xs-12 d-flex

    ---

    Getting started
    ^^^^^^^^^^^^^^^

    New to AGVis? Getting started contains instructions
    for setting up AGVis and will take you through command-line interface to run a
    simple visualization.

    +++

    .. link-button:: getting-started
            :type: ref
            :text: To the getting started guides
            :classes: btn-block btn-secondary stretched-link

    ---

    Advanced usage
    ^^^^^^^^

    The usage provide instructions on how to use AGVis to its various features,
    including Configuration, MultiLayer, and Independent Data Reader. 

    +++

    .. link-button:: usage
            :type: ref
            :text: To the advanced usage
            :classes: btn-block btn-secondary stretched-link

    ---

    Model development guide
    ^^^^^^^^^^^^^^^^^^^^^^^

    Looking to implement new functionalities in AGVis?
    The development guide provides in-depth information on the
    implementation of the geographical visualization.

    +++

    .. link-button:: development
            :type: ref
            :text: To the development guide
            :classes: btn-block btn-secondary stretched-link
    ---

    API reference
    ^^^^^^^^^^^^^

    The API reference contains a detailed description of the AGVis package. The
    reference describes how the methods work and which parameters can be used.

    +++

    .. link-button:: api_reference
            :type: ref
            :text: To the API reference
            :classes: btn-block btn-secondary stretched-link

    ---
    :column: col-12 p-3

    Using AGVis for Research?
    ^^^^^^^^^^^^^^^^^^^^^^^^^
    Please cite our paper [Parsly2022]_ if AGVis is used in your research for
    publication.


.. [Parsly2022] N. Parsly, J. Wang, N. West, Q. Zhang, H. Cui and F. Li, "DiME and AGVIS:
       A Distributed Messaging Environment and Geographical Visualizer for
       Large-scale Power System Simulation," in arXiv, Nov. 2022, doi: arXiv.2211.11990.

.. toctree::
   :caption: AGVis Manual
   :maxdepth: 2
   :hidden:

   getting_started/index
   usage/index
   modeling/index
   release-notes
   api
