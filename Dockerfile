FROM ubuntu:bionic AS base

RUN apt-get update && \
    apt-get install -y \
        python3.7 \
	python3-pip \
    && \
    rm -rf /var/lib/apt/lists/*

#RUN python3 -m pip install \
#	requests

ENTRYPOINT []
CMD []


FROM base AS dist

WORKDIR /app
COPY server.py /app/

ENTRYPOINT ["python3.7", "-u", "server.py"]
CMD []
