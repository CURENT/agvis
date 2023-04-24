.. _tmux:

Using AGVis with tmux in Linux
================================

.. _`VSCode`: https://code.visualstudio.com/

Running AGVis
---------------------------

Using a terminal (we would suggest `VSCode`_), log into the Linux server with SSH. 
Then use this command to download the LTB repository::

    git clone https://github.com/CURENT/ltb --recursive

After it's finished downloading, move to the AGVis folder and create the initial build::

    cd ltb/agvis
    ./go.sh build

Once the initial build is completed, setup the environment by running these commands in your terminal::

    tmux
    ./go.sh dev2

By running those two commands, your window should be populated with several tmux sessions.
At this point you may need to forward ports 8810 and 8818 if they are not automatically forwarded.
Once your ports are set up, you should be able to go to "localhost:8810" in your browser and see AGVis running.
If you then run the command in the bottom tmux window, the simulation will start playing.

Troubleshooting
^^^^^^^^^^^^^^^^^^^^

Port Already in Use Error
"""""""""""""""""""""""""""""""""""""""""""""""
If you receive this error, then you may need to check the ``/tmp`` directory in your system.
If there is a folder called "dime" or "dime2", remove it. That should fix the error.

ANDES Does Not Exist Error
"""""""""""""""""""""""""""""""""""""""""""""""
If ANDES doesn't exist, then your best bet is usually just rebuilding your environment.
Running ``./go.sh clean`` and then running the second and third set of commands again should fix the issue.

.. _input-formats:
