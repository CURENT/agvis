.. _sec-command:

Command line
============

Basics
------

AGVis is invoked from the command line using the command ``agvis``. Running
``agvis`` without any input is equal to  ``agvis -h`` or ``agvis --help``. It
prints out a preamble with version and environment information, followed by
and help commands ::


        _   _____   ___     | Version 3.0.0
       /_\ / __\ \ / (_)___ | Python 3.9.16 on Linux, 04/24/2023 07:49:26 PM
      / _ \ (_ |\ V /| (_-< | 
     /_/ \_\___| \_/ |_/__/ | Web-based geographical visualizer.

    usage: agvis [-h] [-v {1,10,20,30,40}] {run} ...

    positional arguments:
    {run}                 [run] serve the web;

    options:
    -h, --help            show this help message and exit
    -v {1,10,20,30,40}, --verbose {1,10,20,30,40}
                          Verbosity level in 10-DEBUG, 20-INFO, 30-WARNING, or 40-ERROR.

.. note::

    If the ``agvis`` command is not found, it could be due to

    (1) missed steps in your installation process
    (2) errors during installation
    (3) forgot to activated the environment with AGVis


.. _agvis-run:

agvis run
----------------

run
..........

``agvis run`` is the entry point for starting the web application.
::


        _   _____   ___     | Version 3.0.0
       /_\ / __\ \ / (_)___ | Python 3.9.16 on Linux, 04/24/2023 07:49:26 PM
      / _ \ (_ |\ V /| (_-< | 
     /_/ \_\___| \_/ |_/__/ | Web-based geographical visualizer.

    Working directory: "/Users/jinningwang/Documents/work/agvis"
    AGVis serves on http://127.0.0.1:8810, open your browser and visit it.
    AGVis started from the command line. Press Ctrl+C to stop it.

You can open the web application in your browser.

.. image:: diagrams/webapplication.png
   :alt: webapplication
   :width: 960px

.. note::

    Windows users will have to use `agvis run` from the `agvis` directory.
    This directory must contain both `app.py` and `__main__.py`.

stop
..........

After using, you can stop the web application by pressing ``Ctrl+C`` in the terminal.
::


        _   _____   ___     | Version 3.0.0
       /_\ / __\ \ / (_)___ | Python 3.9.16 on Linux, 04/24/2023 07:49:26 PM
      / _ \ (_ |\ V /| (_-< | 
     /_/ \_\___| \_/ |_/__/ | Web-based geographical visualizer.

    Working directory: "/Users/jinningwang/Documents/work/agvis"
    AGVis serves on http://127.0.0.1:8810, open your browser and visit it.
    AGVis started from the command line. Press Ctrl+C to stop it.
    ^C

    AGVis stopped, you can close the brwoser.


.. _agvis-misc:

agvis misc
----------
``agvis misc`` contains miscellaneous functions, such as version check and
output cleaning.

Cleanup
.......
``agvis misc -C --clean``

Option to remove any generated files by ANDES and AGVis.
Removes files with any of the following suffix: ``_out.txt`` (power flow report),
``_out.npy`` (time domain data), ``_out.lst`` (time domain variable list),
and ``_eig.txt`` (eigenvalue report).

Version
.......
Check the version of AGVis and the core packages it uses, use

.. code:: bash

    agvis misc --version

Please include the output in your bug report.