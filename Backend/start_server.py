"""
Simple script to start the FastAPI server
Run this with: python Backend/start_server.py
"""

import sys
import os
from pathlib import Path

# Add Backend directory to path so imports work
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
os.chdir(backend_dir)

import uvicorn

if __name__ == "__main__":
    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=True)

