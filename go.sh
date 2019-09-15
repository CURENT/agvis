#!/usr/bin/env bash

tag=ltbweb:$USER
name=ltbweb_$USER
target=base
data=/home/thobson2/tmp/Data/Data
registry=accona.eecs.utk.edu:5000
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
		${data:+-v $data:$data} \
		${xauth:+-e DISPLAY -v /etc/group:/etc/group:ro -v /etc/passwd:/etc/passwd:ro -v /etc/shadow:/etc/shadow:ro -v /etc/sudoers.d:/etc/sudoers.d:ro -v $xauth:$xauth -e XAUTHORITY=$xauth} \
		${entrypoint:+--entrypoint $entrypoint} \
		$tag "$@"
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
python3() { python3.7 "$@"; }
python3.7() { run python3.7 -u "$@"; }
server() { python3.7 server.py --port=$port "$@"; }
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
	tmux split-window -v
	tmux split-window -v
	tmux split-window -v
	tmux send-keys -t0 "#./go.sh dime tcp://127.0.0.1:$((port+9))" Enter
	tmux send-keys -t1 "#./go.sh python server.py --port $((port+0))" Enter
	tmux send-keys -t2 "#./go.sh python wsdime.py --port $((port+1)) --dport $((port+9))" Enter
	tmux send-keys -t3 "#./go.sh andes --routine=tds /opt/andes/cases/ieee14/ieee14_syn.dm --dime=tcp://127.0.0.1:$((port+9))" Enter
}

"$@"
