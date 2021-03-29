# LTBVis

A visualization program for CURENT's Large-scale Test Bed, in the form of a web application. 

## Setup

Note that [Docker](https://www.docker.com/products/docker-desktop) and [tmux](https://tmux.github.io/) are required on any system to run the visualization simulation.

### Linux

First, clone this repository, as well as the [dime2](https://github.com/TheHashTableSlasher/dime2) and [Andes](https://github.com/cuihantao/andes) repositories, in the same directory.

```
$ git clone https://github.com/TheHashTableSlasher/ltbvis
# ...
$ git clone https://github.com/TheHashTableSlasher/dime2
# ...
$ git clone https://github.com/cuihantao/andes
# ...
```

Next, go into the directory for this repository and run `./go.sh build`:

```
$ cd ltbvis
$ ./go.sh dev
```

Note that no compilation of Andes or dime2, nor any extra dependencies, is required, as this is all done inside a Docker image.

### Windows

TBD

## Usage

To run the simulation, create a new tmux session and run `./go.sh dev`:

```
$ tmux
# Now inside the tmux session
$ ./go.sh dev
```

The tmux session should now be populated with several panes, and the selected pane should contain a command to start the simulation. See [this page](https://tmuxcheatsheet.com/) for some example tmux commands.

Now, point a Chromium-based web browser (note that Firefox and other browsers may not view the simulation correctly) to `http://localhost:8810`, and run the aforementioned command to start the simulation.
