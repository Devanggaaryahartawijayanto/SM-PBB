#!/bin/bash
echo "Starting Backend Server..."
cd backend
uv run fastapi dev
