.. _sec-docker:

Docker
================================

.. _`Docker`: https://www.docker.com/
.. _`VSCode`: https://code.visualstudio.com/

Running LTB in Docker
---------------------------------

What is Docker?
---------------------------------

`Docker`_ is a platform that allows developers to easily create, deploy, and run applications in containers. A
container is a lightweight, standalone executable package that includes everything needed to run an application,
including code, runtime, system tools, libraries, and settings. Containers enable developers to package an
application with all of its dependencies into a single, standardized unit for deployment, which ensures that the
application runs consistently across different environments. Docker provides a way to build, ship, and run containers,
making it easy to create and manage containerized applications.

Usage
---------------------------------

Using a terminal (we would suggest `VSCode`_), log into the Linux server with SSH. 
Then use this command to download the LTB repository::

    git clone https://github.com/CURENT/ltb --recursive

After it's finished downloading, move to the AGVis folder and create the initial build::

    cd ltb/agvis
    ./go.sh build

Once the initial build is completed, setup the environment by running these commands in your terminal::

    tmux
    ./go.sh dev2

After running the tmux and ./go.sh dev2 commands, several tmux sessions should appear on your terminal
window. It may be necessary to forward ports 8810 and 8818 to access AGVis through your web browser.
Once the ports are set up, AGVis should be accessible by going to "localhost:8810" in your web browser. To
start the simulation, run the appropriate command in the bottom tmux window.

Troubleshooting
---------------------------------

Port Already in Use Error
^^^^^^^^^^^^^^^^^^^^^^^^^^
If you receive this error, then you may need to check the ``/tmp`` directory in your system.
If there is a folder called "dime" or "dime2", remove it. That should fix the error.

ANDES Does Not Exist Error
^^^^^^^^^^^^^^^^^^^^^^^^^^
If ANDES doesn't exist, then your best bet is usually just rebuilding your environment.
Running ``./go.sh clean`` and then running the second and third set of commands again should fix the issue.