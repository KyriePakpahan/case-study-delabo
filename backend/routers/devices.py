# dependencies
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

# from registry.py
from backend.devices.registry import get_all_devices, get_device

# from adapters
from backend.devices.switchbot import SwitchBotAdapter
from backend.devices.nature_remo import NatureRemoAdapter
from backend.devices.roomba import RoombaAdapter
from backend.devices.cctv import CCTVAdapter

router = APIRouter(prefix="/api/devices", tags=["devices"])

switchbot_adapter = SwitchBotAdapter()
nature_remo_adapter = NatureRemoAdapter()
roomba_adapter = RoombaAdapter()
cctv_adapter = CCTVAdapter()

# input scheme for command request
class CommandRequest(BaseModel):
    command: str
    params: Optional[Dict[str, Any]] = None

@router.get("")
async def list_devices():
    """Take all devices from the registry and return them as a list."""
    return get_all_devices()

@router.get("/{device_id}")
async def get_device_by_id(device_id: str):
    """Take the status of a specific device."""
    device = get_device(device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

@router.post("/{device_id}/command")
async def send_device_command(device_id: str, payload: CommandRequest):
    """Send control command to device based on its ecosystem."""
    device = get_device(device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    ecosystem = device["ecosystem"]
    device_type = device["type"]
    
    updated_device = None

    # dispatch command to the appropriate adapter based on  the ecosystem
    try:
        if ecosystem == "switchbot":
            updated_device = await switchbot_adapter.execute_command(
                device_id, device_type, payload.command, payload.params
            )
        elif ecosystem == "nature_remo":
            updated_device = await nature_remo_adapter.execute_command(
                device_id, device_type, payload.command, payload.params
            )
        elif ecosystem == "roomba":
            updated_device = await roomba_adapter.execute_command(
                device_id, device_type, payload.command, payload.params
            )
        elif ecosystem in ["hikvision", "vivotek"]: 
            updated_device = await cctv_adapter.execute_command(
                device_id, device_type, payload.command, payload.params
            )
            
        if not updated_device:
            raise HTTPException(status_code=400, detail="Invalid command or parameters")
            
        from backend.routers.websocket import manager
        await manager.broadcast({
            "type": "device_update",
            "device": updated_device
        })
        
        return updated_device

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to execute command: {str(e)}")
