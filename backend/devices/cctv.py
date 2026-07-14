import asyncio
from backend.devices.registry import update_device_state


class CCTVAdapter:
    async def execute_command(
        self,
        device_id: str,
        device_type: str,
        command: str,
        params: dict = None,
    ):
        await asyncio.sleep(0.05)

        if device_type != "cctv":
            return None

        params = params or {}
        updates = {}

        if command == "start_stream":
            updates = {"status": "streaming"}
        elif command == "stop_stream":
            updates = {"status": "stopped"}
        elif command == "set_resolution":
            updates = {"properties": {"resolution": params.get("resolution", "1080p")}}
        elif command == "set_fps":
            updates = {"properties": {"fps": params.get("fps", 30)}}

        if updates:
            return update_device_state(device_id, updates)
        return None
