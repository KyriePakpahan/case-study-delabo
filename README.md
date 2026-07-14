# Hospital Ward 3D Digital Twin Iotr Dashboard

A full-stack prototype that combines a Python FastAPI backend with a React + Three.js frontend to deliver a real-time, interactive 3D Digital Twin of a hospital ward. Device control commands are dispatched through a REST API and state updates are pushed to all connected clients via WebSocket.

---

## Repository Structure

```
case-study-delabo/
├── backend/              
│   ├── main.py           
│   ├── requirements.txt   
│   ├── devices/         
│   └── routers/         
├── frontend/          
    ├── src/
    │   ├── components/   
    │   └── hooks/         
    └── public/models/     
```

---

## Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher

### Backend

```bash
# From the project root, create a virtual environment
python -m venv backend/venv

# Activate it
source backend/venv/bin/activate          # macOS / Linux
# backend\venv\Scripts\activate           # Windows

# Install dependencies
pip install -r backend/requirements.txt

# Start the development server
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The server exposes the following:

| Endpoint         | URL                                  |
|------------------|--------------------------------------|
| REST API         | `http://localhost:8000/api/devices`  |
| WebSocket        | `ws://localhost:8000/ws`             |
| Interactive docs | `http://localhost:8000/docs`         |

### Frontend

```bash
cd frontend

npm install
npm run dev
```

The dashboard will be served at `http://localhost:5173`.

> The backend must be running before the frontend is started. On load, the React app opens a WebSocket connection to `ws://localhost:8000/ws` and fetches initial device state. If the backend is offline, the dashboard will display a disconnected state and retry every 3 seconds automatically.

---

## CCTV Demo Setup

The CCTV viewer in the dashboard streams from local MP4 files served by the FastAPI static file server. To enable CCTV playback in the demo:

1. Place two `.mp4` video files in `backend/static/videos/`:
   - `cctv_entrance.mp4`
   - `cctv_patient.mp4`
2. Restart the backend. The files will be served at `http://localhost:8000/static/videos/`.


## CCTV Production Setup

The production pipeline routes each IP camera's RTSP stream through a local media server (go2rtc) before it reaches the browser. RTSP is not natively playable in a browser, so go2rtc acts as a transcoder, re-serving the stream over WebRTC, MSE/fMP4, or HLS depending on what the client supports.

**1. Install go2rtc**

Download the binary for your platform from https://github.com/AlexxIT/go2rtc/releases and place it on the server. No other dependencies are required.

**2. Create `go2rtc.yaml`**

Place this file in the same directory as the go2rtc binary, substituting the correct credentials and IP addresses for the cameras:

```yaml
streams:
  entrance_cam:
    - rtsp://admin:password@192.168.1.10:554/stream1
  ward_cam:
    - rtsp://admin:password@192.168.1.11:554/live.sdp

api:
  listen: :1984
```

Start the server:

```bash
./go2rtc -config go2rtc.yaml
```

go2rtc will be available at `http://localhost:1984`. It exposes the following endpoints per stream:

| Format    | Endpoint                                    | Latency     |
|-----------|---------------------------------------------|-------------|
| WebRTC    | `GET /api/ws?src=entrance_cam`              | 50-150 ms   |
| MSE/fMP4  | `GET /api/stream.mp4?src=ward_cam`          | 300-800 ms  |
| HLS       | `GET /api/stream.m3u8?src=ward_cam`         | 2-10 s      |

WebRTC offers the lowest latency and is recommended for live monitoring. MSE/fMP4 offers the widest browser support. HLS is a fallback for clients that support neither.

**3. Discover cameras via ONVIF**

If camera RTSP URIs are unknown, use the ONVIF protocol to discover them on the local network. Install the Python ONVIF client and run WS-Discovery:

```bash
pip install onvif-zeep
```

```python
from onvif import ONVIFCamera

cam = ONVIFCamera('192.168.1.10', 80, 'admin', 'password')
media = cam.create_media_service()
profiles = media.GetProfiles()
uri = media.GetStreamUri({'StreamSetup': {'Stream': 'RTP-Unicast', 'Transport': {'Protocol': 'RTSP'}}, 'ProfileToken': profiles[0].token})
print(uri.Uri)
```

This returns the RTSP URI to use in `go2rtc.yaml`. ONVIF also supports configuring resolution, framerate, encoding (H.264 / H.265), and PTZ control on cameras that support it.

**4. Update stream URLs in the device registry**

In `backend/devices/registry.py`, replace the static file URLs with the go2rtc MSE endpoints:

```python
#demo
"stream_url": "http://localhost:8000/static/videos/cctv_entrance.mp4"

# production
"stream_url": "http://localhost:1984/api/stream.mp4?src=entrance_cam"
```

The `CCTVViewer.jsx` component reads `stream_url` directly from the device registry and passes it to an HTML5 `<video>` element, so no frontend code changes are needed for MSE/fMP4 streams. For WebRTC, replace the `<video>` element with go2rtc's embedded JavaScript player or integrate a library such as HLS.js.

---

## API Quick Reference

**List all devices**
```
GET /api/devices
```

**Get a single device**
```
GET /api/devices/{device_id}
```

**Send a command**
```
POST /api/devices/{device_id}/command
Content-Type: application/json

{
  "command": "turn_on",
  "params": {}
}
```

On a successful command, the backend updates the in-memory device registry and broadcasts the new state to all connected WebSocket clients.

---

