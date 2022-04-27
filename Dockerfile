FROM python:3.10-buster AS base

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
    zlib1g-dev \
    libev-dev

RUN rm -rf /var/lib/apt/lists/*

RUN python3 -m pip install kvxopt \
    git+https://github.com/cuihantao/andes@develop \
    --no-cache-dir

RUN useradd -ms /bin/bash cui && \
    mkdir -p /home/cui/work

RUN python3 -m andes selftest && \
    mv /root/.andes /home/cui && \
    chown -R cui:cui /home/cui/.andes

# build DiME 2
WORKDIR /tmp
COPY dime /tmp/dime
WORKDIR /tmp/dime/server
RUN make clean && \
    make && \
    make install
WORKDIR /tmp/dime/client/python
RUN python3 -m pip install .

WORKDIR /tmp
RUN rm -rf /tmp/dime

USER cui
WORKDIR /home/cui/work

COPY andes.rc /home/cui/.andes

ENTRYPOINT []
CMD []
