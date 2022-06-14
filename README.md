# AGVis

Another Grid Visualizer, visualization program for CURENT's Large-scale Test Bed, in the form of a web application.

## Setup

Note that [Docker](https://www.docker.com/products/docker-desktop) and [tmux](https://tmux.github.io/) are required on any system to run the visualization simulation.

### Linux

First, clone this repository, as well as the [dime](https://github.com/TheHashTableSlasher/dime) and [Andes](https://github.com/cuihantao/andes) repositories, in the same directory.

```
$ git clone https://github.com/CURENT/ltb2
# ...
```

Next, go into the directory for this repository and run `./go.sh build`:

```
$ cd agvis
$ ./go.sh build
```

Note that no compilation of Andes or dime, nor any extra dependencies, is required, as this is all done inside a Docker image.

### Windows

TBD

## Usage

## With tmux

To run the simulation, create a new tmux session and run `./go.sh dev`:

```
$ tmux
# Now inside the tmux session
$ ./go.sh dev
```

The tmux session should now be populated with several panes, and the selected pane should contain a command to start the simulation. See [this page](https://tmuxcheatsheet.com/) for some example tmux commands.

Now, point a Chromium-based web browser (note that Firefox and other browsers may not view the simulation correctly) to `http://localhost:8810`, and run the aforementioned command to start the simulation.

## Manually

The commands that tmux runs may also be run in any sort of shell session:

```
$ docker run --rm -t -v `pwd`/static:/srv -p 8810:8810 ltbvis:$USER python3 -m http.server -d /srv 8810 &
$ docker run --rm -t -v /tmp:/tmp -p 8818:8818 agvis:$USER dime -vv -l unix:/tmp/dime2 -l ws:8818 &
# When you want to start the simulation, type:
$ docker run --rm -t -v /tmp:/tmp agvis:$USER andes -v 10 run /home/cui/wecc_vis.xlsx -r tds
```

A few notes:

* The exact Docker image tag may change depending on how you built it with `./go.sh build`
* Existing Docker images, containers, and tmux sessions can be cleaned by ``./go.sh clean``
* The simulation may also be altered as desired. wecc_vis.xlsx, ieee39.xlsx, and ACTIVSg2000.xlsx all come with this repository, and are copied to the image upon building.
* None of the above commands necessarily require Docker, and may be subsituted as desired:
  - The first line simply opens up an HTTP server, but any httpd (Apache, Nginx, Lighttpd, even something as basic as [mini_httpd](http://www.acme.com/software/mini_httpd/)) on port 8810 will suffice.
  - dime2 can easily be compiled natively, see its README.md for instructions.
  - Andes is a bit trickier to set up without Docker, so its recommended to be used in the above configuration. However, it can be done with enough effort. Install the correct Python dependencies, and run the commands in the Dockerfile to set it up.
