# dependencies
import asyncio
from backend.devices.registry import update_device_state

class SwitchBotAdapter:
    async def execute_command(self, device_id: str, device_type: str,command: str, params: dict = None):

        # network latency simulation
        await asyncio.sleep(0.2)

        params = params or {}
        updates = {}

        if device_type == "lamp":
            if command == "turn_on":
                updates = {"status" : "on"}
            elif command == "turn_off":
                updates = {"status" : "off"}
            elif command == "set_brightness":
                updates = {"properties": {"brightness": params.get("brightness", 100)}}
            elif command == "set_color_temp":
                updates = {"properties": {"color_temp": params.get("color_temp", 4000)}}

        elif device_type == "lock":
            if command == "lock":   
                updates = {"status": "locked"}
            elif command == "unlock":
                updates = {"status": "unlocked"}
        
        elif device_type == "bot":
            if command == "press":
                updated = update_device_state(device_id, {"status": "pressing"})

                asyncio.create_task(self._reset_bot_after_delay(device_id))
                return updated
        
        if updates:
            return update_device_state(device_id, updates)
        return None

    async def  _reset_bot_after_delay(self, device_id: str):
        await asyncio.sleep(1.0)  

        from backend.devices.registry import update_device_state
        updated =update_device_state(device_id, {"status": "idle"})

        try:
            from backend.routers.websocket import manager
            await manager.broadcast({
                "type": "device_update",
                "device": updated
            })
        except Exception as e:
            print(f"Failed to broadcast background update: {e}")