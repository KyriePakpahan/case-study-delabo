# dependencies
import asyncio
from backend.devices.registry import update_device_state

class NatureRemoAdapter:
    async def execute_command(self, device_id: str, device_type: str, command: str, params: dict = None):

        # network latency simulation (200ms)
        await asyncio.sleep(0.2)

        params = params or {}
        updates = {}

        if device_type == "ac":
            if command == "turn_on":
                updates = {"status": "on"}
            elif command == "turn_off":
                updates = {"status": "off"}
            elif command == "set_temperature":
                updates = {"properties": {"temperature": params.get("temperature", 18)}}
            elif command == "set_mode":
                updates = {"properties": {"mode": params.get("mode", "cool")}}
            elif command == "set_fan_speed":
                updates = {"properties": {"fan_speed": params.get("fan_speed", "auto")}}

        elif device_type == "tv":
            if command == "turn_on":
                updates = {"status": "on"}
            elif command == "turn_off":
                updates = {"status": "off"}
            elif command == "set_volume":
                updates = {"properties": {"volume": params.get("volume", 15)}}
            elif command == "set_channel":
                updates = {"properties": {"channel": params.get("channel", 1)}}

        if updates:
            return update_device_state(device_id, updates)
        return None