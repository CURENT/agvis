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


Version
.......
Check the version of AGVis and the core packages it uses, use

.. code:: bash

    agvis misc --version

Please include the output in your bug report.