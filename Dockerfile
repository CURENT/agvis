# Start with a base Python 3.10 image from the Debian Buster distribution
FROM python:3.10-buster AS base

# Switch to the root user and set the working directory to /root
USER root
WORKDIR /root

# Install required packages for building and running the software
RUN apt update \
    && apt install -y --no-install-recommends \
        git \
        build-essential \
        libsuitesparse-dev \
        libopenblas-dev \
        libjansson-dev \
        libssl-dev \
        zlib1g-dev \
        libev-dev \
    && rm -rf /var/lib/apt/lists/*

# Install the necessary Python packages
RUN python3 -m pip install \
        kvxopt \
        git+https://github.com/cuihantao/andes.git@develop \
        --no-cache-dir \
    && python3 -m pip install \
        git+https://github.com/CURENT/agvis.git@master \
        --no-cache-dir

# Create a new user named 'cui' and a work directory
RUN useradd -ms /bin/bash cui && \
    mkdir -p /home/cui/work

# Run selftest for the Andes package and move the config file to the new user's home directory
RUN python3 -m andes selftest && \
    mv /root/.andes /home/cui && \
    chown -R cui:cui /home/cui/.andes

# Build DiME 2 and install the Python client library
WORKDIR /tmp
RUN git clone https://github.com/CURENT/dime.git && \
    cd dime/server && \
    make clean && \
    make && \
    make install && \
    cd ../client/python && \
    python3 -m pip install . && \
    cd ../../ && \
    rm -rf dime \
    && rm -rf /tmp/dime

# Switch to the 'cui' user and set the working directory to the new user's work directory
USER cui
WORKDIR /home/cui/work

# Copy the Andes config file to the new user's home directory
COPY andes.rc /home/cui/.andes

# Copy the current AGVis directory into the container.
COPY . .

# Set the entrypoint and command for the container
ENTRYPOINT []
CMD []
