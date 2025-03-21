# Base image supports Nvidia CUDA and is based on Ubuntu
FROM nvidia/cuda:12.6.2-base-ubuntu22.04

USER root
ENV TORCH_HOME=/data/models
ENV OMP_NUM_THREADS=1

# Install required tools and libraries
# Note: ffmpeg is needed for torchaudio (>= 0.12) on Linux,
# and build-essential/python3-dev are included for building native extensions.
RUN apt update && apt install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    git \
    python3 \
    python3-dev \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Demucs via pip
RUN python3 -m pip install --upgrade pip && \
    python3 -m pip install demucs

# Set working directory and add test.mp3 to trigger the model download
WORKDIR /app
RUN mkdir tests
COPY test.mp3 /app/tests/test.mp3

# Run Demucs once (using CPU for the test) to download the default model
RUN python3 -m demucs -d cpu ./tests/test.mp3 && rm -rf separated

# Define volume for caching models on the host machine
VOLUME /data/models

# Define volumes for input and output data
VOLUME /data/input
VOLUME /data/output

CMD ["/bin/bash"]
