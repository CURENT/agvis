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

ARG andes_addon_version=89e6f3f11f63
WORKDIR /tmp
COPY curent-andes_addon-${andes_addon_version}.zip /tmp/
WORKDIR /opt
RUN unzip /tmp/curent-andes_addon-${andes_addon_version}.zip -d /opt/ && \
    rm /tmp/curent-andes_addon-${andes_addon_version}.zip && \
    mv /opt/curent-andes_addon-${andes_addon_version} /opt/andes_addon && \
    python3.7 -m pip install \
        /opt/andes_addon

ARG andes_version=master
WORKDIR /tmp
COPY andes-${andes_version}.zip /tmp/
WORKDIR /opt
RUN unzip /tmp/andes-${andes_version}.zip -d /opt/ && \
    rm /tmp/andes-${andes_version}.zip && \
    mv /opt/andes-${andes_version} /opt/andes && \
    python3.7 -m pip install \
        /opt/andes

ARG dime_version=b43d58ba70df
WORKDIR /tmp
COPY dime-${dime_version}.zip /tmp/
WORKDIR /opt
RUN unzip /tmp/dime-${dime_version}.zip -d /opt/ && \
    rm /tmp/dime-${dime_version}.zip && \
    mv /opt/curent-dime-${dime_version} /opt/dime && \
    python2.7 -m pip install \
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
