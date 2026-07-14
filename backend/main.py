# dependencies 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from backend.routers import devices, websocket

app = FastAPI(
    title="Hospital Ward IoT Orchestrator",
    description="Backend Orchestrator for 3D Digital Twin Hospital Ward",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"  ],  
    allow_credentials = True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

base_dir = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(base_dir, "static")

os.makedirs(os.path.join(static_dir, "videos"), exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

app.include_router(devices.router)
app.include_router(websocket.router)

@app.get("/")
async def root():
    return {
        "message": "Hospital Ward IoT Orchestrator is running!",
        "docs_url": "/docs",
        "websocket_url": "/ws"
    }