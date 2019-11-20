FROM ubuntu:bionic AS base

RUN apt-get update && \
    apt-get install -y \
        python2.7 \
	python-pip \
        python3.7 \
	python3-pip \
	libblas-dev \
	liblapack-dev \
	libsuitesparse-dev \
	unzip \
    && \
    rm -rf /var/lib/apt/lists/*

ARG PIP_INDEX_URL
ARG PIP_TRUSTED_HOST

ARG andes_version=master
WORKDIR /opt
COPY andes /opt/andes
RUN python3.7 -m pip install \
        /opt/andes

ARG andes_addon_version=89e6f3f11f63
WORKDIR /opt
COPY andes_addon /opt/andes_addon
RUN python3.7 -m pip install \
        /opt/andes_addon

ARG dime_version=b43d58ba70df
WORKDIR /opt
COPY dime /opt/dime
RUN python3.7 -m pip install \
        /opt/dime

RUN python3.7 -m pip install \
        websockets

RUN sed -ie 's/# Fault/Fault/g' /opt/andes/cases/curent/WECC_WIND0.dm
RUN python3.7 -m pip install \
        netaddr \
        pandas

ENTRYPOINT []
CMD []


FROM base AS dist

WORKDIR /app
COPY server.py /app/

ENTRYPOINT ["python3.7", "-u", "server.py"]
CMD []
