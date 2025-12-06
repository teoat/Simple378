#!/bin/bash

# Start Backend Server
cd backend
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
