#!/bin/bash
# scripts/setup-venv.sh
# This script sets up a Python virtual environment for the project.
# It creates a venv in the "env" directory, activates it, upgrades pip,
# and installs dependencies from requirements.txt if available.
#
# If the virtual environment already exists, the script will print a message and exit.

set -e

# Check if python3 is available.
if ! command -v python3 &>/dev/null; then
  echo "Error: python3 could not be found. Please install Python 3." >&2
  exit 1
fi

# Check if the virtual environment already exists.
if [ -d "env" ]; then
  echo "Virtual environment already exists in ./env. Exiting."
  exit 0
fi

# Create a new virtual environment in the "env" directory.
echo "Creating virtual environment in ./env ..."
python3 -m venv env

# Activate the virtual environment.
echo "Activating virtual environment..."
source env/bin/activate

# Upgrade pip.
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies if requirements.txt exists.
if [ -f "requirements.txt" ]; then
  echo "Installing dependencies from requirements.txt..."
  pip install -r requirements.txt
else
  echo "No requirements.txt file found. Please create one or install packages manually."
fi

echo "Virtual environment setup complete."
echo "To activate the virtual environment in future sessions, run: source env/bin/activate"
