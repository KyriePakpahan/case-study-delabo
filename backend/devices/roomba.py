# dependencies
import asyncio
from backend.devices.registry import update_device_state

class RoombaAdapter:
    async def execute_command(self, device_id: str, device_type: str, command: str, params: dict = None):

        # network latency simulation (50ms)
        await asyncio.sleep(0.05)
        
        updates = {}

        if command == "start":
            updates = {"status": "cleaning"}
        elif command == "stop":
            updates = {"status": "docked"}
        elif command == "dock":
            updates = {"status": "returning"}
            asyncio.create_task(self._finish_docking(device_id))


        if updates:
            return update_device_state(device_id, updates)
        return None
    
    async def _finish_docking(self, device_id: str):
        await asyncio.sleep(3.0)

        from backend.devices.registry import update_device_state
        updated =update_device_state(device_id, {"status": "docked", "properties": {"battery": 100}})

        try:
            from backend.routers.websocket import manager
            await manager.broadcast({
                "type": "device_update",
                "device": updated
            })
        except Exception as e:
            print(f"Failed to broadcast background update: {e}")

