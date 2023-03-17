#!/usr/bin/env bash

tag=agvis:$USER
name=agvis_$USER
target=base
data=/Users/hcui7/tmp
registry=ltb.curent.utk.edu:5000
xauth=
entrypoint=
ipc=
net=host
user=1
cwd=1
interactive=1
script=
port=8810
pipindex=
piptrustedhost=

[ -f env.sh ] && . env.sh

build() {
    cp -af ../andes .
    cp -af ../dime .
    docker build \
        ${target:+--target $target} \
        ${pipindex:+--build-arg PIP_INDEX_URL=$pipindex} \
        ${piptrustedhost:+--build-arg PIP_TRUSTED_HOST=$piptrustedhost} \
        -t $tag .
}

run() {
    if [ -n "$xauth" ]; then
        rm -f $xauth
        xauth nlist $DISPLAY | sed -e 's/^..../ffff/' | xauth -f $xauth nmerge -
    fi

    docker run --rm \
        ${interactive:+-it} \
        ${script:+-a stdin -a stdout -a stderr --sig-proxy=true} \
        ${ipc:+--ipc=$ipc} \
        ${net:+--net=$net} \
        ${user:+-u $(id -u):$(id -g)} \
        ${cwd:+-v $PWD:$PWD -w $PWD} \
        ${port:+-p $port:$port} \
        ${port2:+-p $port2:$port2} \
        ${data:+-v $data:$data} \
        ${xauth:+-e DISPLAY -v /etc/group:/etc/group:ro -v /etc/passwd:/etc/passwd:ro -v /etc/shadow:/etc/shadow:ro -v /etc/sudoers.d:/etc/sudoers.d:ro -v $xauth:$xauth -e XAUTHORITY=$xauth} \
        ${entrypoint:+--entrypoint $entrypoint} \
        $tag "$@"
}

run_8810() {
    port=8810
    net=
    run "$@"
}
run_8811() {
    port=8811
    net=host
    run "$@"
}
run_8812() {
    port=8812
    net=host
    run "$@"
}
run_8819() {
    port=8819
    port2=8818
    net=
    run "$@"
}

inspect() {
    entrypoint='/bin/bash -i' run "$@"
}

script() {
    interactive= script=1 run "$@"
}

push() {
    docker tag $tag $registry/$tag
    docker push $registry/$tag
}

create() {
    docker service create \
        ${name:+--name $name} \
        ${cwd:+--mount type=bind,src=$PWD,dst=$PWD} \
        ${data:+--mount type=bind,src=$data,dst=$data} \
        $registry/$tag \
        "$@"
}

destroy() {
    docker service rm $name
}

logs() {
    docker service logs $name "$@"
}

python() { python3 "$@"; }
python3() { run python3 -u "$@"; }
server() { python3 server.py --port=$port "$@"; }
andes() { run andes "$@"; }
reader() {
    python benchmark.py --dime tcp://127.0.0.1:$port,reader,writer "$@" reader
}
writer() {
    python benchmark.py --dime tcp://127.0.0.1:$port,writer,reader "$@" writer
}
dime() {
    run dime ${1:-tcp://0.0.0.0:8819} --debug
}

dev-benchmark() {
    tmux split-window -v
    tmux split-window -v
    tmux send-keys -t0 "#./go.sh dime" Enter
    tmux send-keys -t1 "#./go.sh reader" Enter
    tmux send-keys -t2 "#./go.sh writer" Enter
}

dev() {
    google-chrome --incognito http://localhost:8810/ 2> /dev/null > /dev/null &!

    tmux split-window -v
    tmux split-window -v
    tmux select-layout tiled
    tmux send-keys -t0 "docker run --rm -t -v `pwd`/static:/srv -p 8810:8810 $tag python3 -m http.server -d /srv $((port+0))" Enter
    tmux send-keys -t1 "docker run --rm -t -v /tmp:/tmp -p 8818:8818 $tag dime -vv -l unix:/tmp/dime2 -l ws:$((port+8))" Enter
    tmux send-keys -t2 "docker run --rm -t -v /tmp:/tmp -v `pwd`/cases:/home/cui/work $tag andes -v 10 run wecc_vis.xlsx -r tds"
}

dev-cygwin() {
    google-chrome --incognito http://localhost:8810/ 2> /dev/null > /dev/null &!

    mintty --exec "docker run --rm -t -v C:/cygwin64/`pwd`/static:/srv -p 8810:8810 $tag python3 -m http.server -d /srv $((port+0))" &!
    mintty --exec "docker run --rm -t -p 5000:5000 -p 8818:8818 $tag dime -vv -l tcp:5000 -l ws:$((port+8))" &!
    #mintty --exec "docker run --rm -t $tag andes -v 10 run /home/cui/wecc_vis.xlsx --dime tcp://127.0.0.1:5000 -r tds" &!
}

dime-cygwin() {
    docker run --rm -it -p 5000:5000 -p 8818:8818 $tag dime -vv -l tcp:5000 -l ws:$((port+8))
}

http-cygwin() {
    docker run --rm -it -v C:/cygwin64/`pwd`/static:/srv -p 8810:8810 $tag python3 -m http.server -d /srv $((port+0))
}

dev2() {
    google-chrome --incognito http://localhost:8810/ 2> /dev/null > /dev/null &!

    tmux split-window -v
    tmux split-window -v
    tmux select-layout tiled
    tmux send-keys -t0 "docker run --rm -t -v `pwd`/static:/srv -p 8810:8810 $tag python3 -m http.server -d /srv $((port+0))" Enter
    tmux send-keys -t1 "docker run --rm -t -v /tmp:/tmp -p 8818:8818 $tag dime -vv -l unix:/tmp/dime2 -l ws:$((port+8))" Enter
    tmux send-keys -t2 " docker run -u root --rm -t -v /tmp:/tmp -v `pwd`/cases:/home/cui/work $tag andes run wecc.xlsx -r tds --dime-address ipc:///tmp/dime2"
}

clean() {
    docker kill $(docker ps -q)
    docker rmi $(docker images -a -q)
    tmux kill-server
    rm /tmp/dime
    rm /tmp/dime2
}

"$@"
