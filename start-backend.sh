#!/bin/bash

# Start Backend Server
cd backend

# Check if venv exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate venv
source .venv/bin/activate

# Install or upgrade dependencies
echo "Installing/upgrading dependencies..."
python3 -m pip install --upgrade pip > /dev/null 2>&1
python3 -m pip install -r requirements.txt

# Start server
echo "Starting backend server..."
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
