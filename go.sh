#!/usr/bin/env bash

tag=ltbvis:$USER
name=ltbvis_$USER
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
    cp -rf ../andes .
    cp -rf ../andes_addon .
    #cp -rf ../dime .
    cp -f dime.py andes_addon/andes_addon
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
	tmux split-window -v
	tmux split-window -v
	tmux select-layout tiled
	tmux send-keys -t0 "./go.sh run_8819 dime -v -l tcp:$((port+9)) -l ws:$((port+8))" Enter
	tmux send-keys -t1 "./go.sh run_8810 python3 server.py --port $((port+0)) --bind 0.0.0.0" Enter
	tmux send-keys -t2 "sleep 1 && ./go.sh run_8811 python3 wsdime.py --port $((port+1)) --dhost tcp://127.0.0.1:$((port+9))" Enter
	tmux send-keys -t3 "sleep 1 && ./go.sh run_8812 python3 wsdime.py --port $((port+2)) --dhost tcp://127.0.0.1:$((port+9)) --name geovis2" Enter
	tmux send-keys -t4 "./go.sh andes --routine=tds /opt/andes/cases/curent/WECC_WIND0.dm --dime=tcp://127.0.0.1:$((port+9))"
}

"$@"
