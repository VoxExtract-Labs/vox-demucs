# -------------------------------
# Builder Stage
# -------------------------------
FROM python:3.10-slim as builder

# Install necessary system dependencies:
# - git: for cloning (if needed)
# - ffmpeg: required by torchaudio/demucs
# - build-essential: for compiling native extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    ffmpeg \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

# Create a virtual environment at /opt/venv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip and install build tools
RUN pip install --upgrade pip setuptools wheel

# Install Demucs (and its heavy dependencies) from PyPI
RUN pip install --no-cache-dir demucs

# Set working directory and copy test.mp3 to trigger model download
WORKDIR /app
COPY test.mp3 /app/test.mp3
RUN python -m demucs -d cpu test.mp3 && rm -rf separated

# -------------------------------
# Final Runtime Stage
# -------------------------------
FROM python:3.9-slim

# Copy the prebuilt virtual environment from the builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set working directory and copy test.mp3 (if needed)
WORKDIR /app
RUN mkdir tests
COPY test.mp3 /app/tests/test.mp3

# Declare a volume for cached models
VOLUME /data/models

# Define volumes for input and output data
VOLUME /data/input
VOLUME /data/output

# Use the virtual environment's python to display Demucs help by default
CMD ["/opt/venv/bin/python", "-m", "demucs", "--help"]
