
Scripting
=========
This section is a tutorial for using AGVis in an interactive/scripting
environment. All scripting shells are supported, including Python shell,
IPython, Jupyter Notebook and Jupyter Lab. The examples below uses Jupyter
Notebook.

Jupyter Notebook
----------------
Jupyter notebook is a convenient tool to run Python code and present results.
Jupyter notebook can be installed with

.. code:: bash

    conda install jupyter notebook

After the installation, change directory to the folder where you wish to store
notebooks, then start the notebook with

.. code:: bash

    jupyter notebook

A browser window should open automatically with the notebook browser loaded. To
create a new notebook, use the "New" button near the upper-right corner.

.. note::

    In the following, code that starts with ``>>>`` are Python code. and should
    be run inside Python, IPython, or Jupyter Notebook. Python code should not
    be entered into Anaconda Prompt or Linux shell.

Import
------
Like other Python libraries, ANDES needs to be imported into an interactive
scripting Python environment.

.. code:: python

    import agvis
    agvis.config_logger()

Verbosity
------------------------------------
If you are debugging AGVis, you can enable debug messages with

.. code:: python

    agvis.config_logger(stream_level=10)

or simply

.. code:: python

    agvis.config_logger(10)

The ``stream_level`` uses the same verbosity levels as for the command-line. If
not explicitly enabled, the default level 20 (INFO) will apply.

To set a new logging level for the current session, call ``config_logger`` with
the desired new levels.

Start a Webapp
---------------
Before visualizing results, a web app need to be created.

.. code:: python

    web = agvis.webapp()
    web.run(open_browser=True)

which is equivalent to the following shell command:

.. code:: bash

    agvis run

.. _tmux:
