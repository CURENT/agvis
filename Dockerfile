FROM python:3.8-buster AS base

USER root
WORKDIR /root

RUN apt update
RUN apt install -y --no-install-recommends \
    git \
    build-essential \
    libsuitesparse-dev \
    libopenblas-dev \
    libjansson-dev \
    libssl-dev \
    zlib1g-dev

RUN rm -rf /var/lib/apt/lists/*

RUN python3 -m pip install kvxopt \
    git+git://github.com/cuihantao/andes@develop \
    --no-cache-dir

RUN useradd -ms /bin/bash cui && \
    mkdir -p /home/cui/work

RUN python3 -m andes selftest && \
    mv /root/.andes /home/cui && \
    chown -R cui:cui /home/cui/.andes


# build DiME 2
WORKDIR /tmp
COPY dime2 /tmp/dime2
WORKDIR /tmp/dime2/server
RUN make clean && \
    make && \
    make install
WORKDIR /tmp/dime2/client/python
RUN python3 -m pip install .

WORKDIR /tmp
RUN rm -rf /tmp/dime2

USER cui
WORKDIR /home/cui/work

COPY andes.rc /home/cui/.andes

ENTRYPOINT []
CMD []
