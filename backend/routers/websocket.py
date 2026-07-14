# dependencies
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: dict):
        """Send data to all connected clients."""
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                self.disconnect(connection)
                pass

manager = ConnectionManager()
router = APIRouter(prefix="/ws", tags=["websocket"])    

@router.websocket("")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    from backend.devices.registry import get_all_devices, get_device
    try:
        # send all devices to the client when it connects
        await manager.send_personal_message(json.dumps({
            "type": "init",
            "devices": get_all_devices()
        }), websocket)

        while True:
            await websocket.receive_text()  
        
    except WebSocketDisconnect:
        manager.disconnect(websocket)


