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

RUN python3 -m pip install cvxoptklu --no-cache-dir
RUN python3 -m pip install https://github.com/cuihantao/andes/zipball/develop --no-cache-dir
RUN python3 -m pip install https://github.com/curent/cvxopt/zipball/master --no-cache-dir

RUN useradd -ms /bin/bash cui

RUN python3 -m andes selftest
RUN mv /root/.andes /home/cui
COPY wecc_vis.xlsx /home/cui
COPY ieee39.xlsx /home/cui
COPY ACTIVSg2000.xlsx /home/cui
RUN chown -R cui:cui /home/cui/.andes
COPY andes.rc /home/cui/.andes

WORKDIR /tmp
COPY dime2 /tmp/dime2
WORKDIR /tmp/dime2/server
RUN make clean
RUN make
RUN make install
WORKDIR /tmp/dime2/client/python
RUN python3 -m pip install .

WORKDIR /tmp
RUN rm -rf /tmp/dime2

WORKDIR /app
COPY server.py /app

USER cui
WORKDIR /home/cui

ENTRYPOINT []
CMD []
