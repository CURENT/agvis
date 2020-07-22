FROM python:3.8-buster AS base

RUN apt-get update
RUN apt-get install -y build-essential libjansson-dev libssl-dev zlib1g-dev

ARG PIP_INDEX_URL
ARG PIP_TRUSTED_HOST

ARG andes_version=master
WORKDIR /opt
COPY andes /opt/andes
RUN python3 -m pip install /opt/andes

ARG andes_addon_version=89e6f3f11f63
WORKDIR /opt
COPY andes_addon /opt/andes_addon
RUN python3 -m pip install /opt/andes_addon

ARG dime2_version=master
WORKDIR /opt
COPY dime2 /opt/dime2
WORKDIR /opt/dime2/server
RUN make clean
RUN make
RUN make install
WORKDIR /opt/dime2/client/python
RUN python3 setup.py install

RUN python3 -m pip install netaddr pandas websockets

RUN sed -ie 's/# Fault/Fault/g' /opt/andes/cases/curent/WECC_WIND0.dm

ENTRYPOINT []
CMD []

FROM base AS dist

WORKDIR /app
COPY server.py /app/

ENTRYPOINT ["python3.7", "-u", "server.py"]
