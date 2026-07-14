# dummy data
DEVICES = {
    # Switchbot
    "switchbot-lamp-01": {
        "id": "switchbot-lamp-01",
        "name": "Patient Bed Light",
        "type": "lamp",
        "ecosystem": "switchbot",
        "status": "off",
        "properties": {
            "brightness": 70,      # 0-100%
            "color_temp": 3000      # Warm White
        }
    },
    "switchbot-humidity-01": {
        "id": "switchbot-humidity-01",
        "name": "Ward Temperature & Humidity",
        "type": "humidity",
        "ecosystem": "switchbot",
        "status": "active",
        "properties": {
            "humidity": 55.4,       # %
            "temperature": 23.5     # Celcius
        }
    },
    "switchbot-bot-01": {
        "id": "switchbot-bot-01",
        "name": "Nurse Call Switch",
        "type": "bot",
        "ecosystem": "switchbot",
        "status": "idle",           # idle, pressing
        "properties": {}
    },
    "switchbot-lock-01": {
        "id": "switchbot-lock-01",
        "name": "Ward Entrance Lock",
        "type": "lock",
        "ecosystem": "switchbot",
        "status": "locked",         # locked, unlocked
        "properties": {
            "battery": 92
        }
    },

    # Nature Remo
    "nature-remo-ac-01": {
        "id": "nature-remo-ac-01",
        "name": "Ward Air Conditioner",
        "type": "ac",
        "ecosystem": "nature_remo",
        "status": "off",            # on, off
        "properties": {
            "temperature": 22,      # Celcius
            "mode": "cool",         # cool, heat, dry, fan
            "fan_speed": "auto"     # auto, low, medium, high
        }
    },
    "nature-remo-tv-01": {
        "id": "nature-remo-tv-01",
        "name": "Ward TV",
        "type": "tv",
        "ecosystem": "nature_remo",
        "status": "off",            # on, off
        "properties": {
            "volume": 15,           # 0-100
            "channel": 5            # channel number
        }
    },
        
    # Roomba  
    "roomba-01": {
        "id": "roomba-01",
        "name": "Robotic Cleaner Roomba",
        "type": "vacuum",
        "ecosystem": "roomba",
        "status": "docked",         # docked, cleaning, returning, charging
        "properties": {
            "battery": 88,          # %
            "bin_full": False
        }
    },
    # CCTV Cameras 
    "cctv-entrance": {
        "id": "cctv-entrance",
        "name": "Entrance Camera",
        "type": "cctv",
        "ecosystem": "hikvision",
        "status": "streaming",
        "properties": {
            "resolution": "1080p",
            "fps": 30,
            
            "stream_url": "http://localhost:8000/static/videos/cctv_entrance.mp4"
        }
    },
    "cctv-showroom": {
        "id": "cctv-showroom",
        "name": "Main Showroom Camera",
        "type": "cctv",
        "ecosystem": "vivotek",
        "status": "streaming",
        "properties": {
            "resolution": "1080p",
            "fps": 30,
            "stream_url": "http://localhost:8000/static/videos/cctv_patient.mp4"
        }
    }
}


# helper
def get_all_devices ():
    return list(DEVICES.values())

def get_device (device_id: str):
    return DEVICES.get(device_id)

def update_device_state (device_id: str, updates: dict):
    if device_id in DEVICES:
        if "status" in updates:
            DEVICES[device_id]["status"] = updates["status"]

        if "properties" in updates:
            DEVICES[device_id]["properties"].update(updates["properties"])
        return DEVICES[device_id]
    return None
