// depedencies
import { useState, useEffect, useCallback, useRef } from 'react';

export function useWebSocket() {
  const [devices, setDevices] = useState([]);
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);

  // conncetion to websocket server
  const connect = useCallback(() => {
   
    if (ws.current && ws.current.readyState === WebSocket.OPEN) return;

    const wsUrl = 'ws://localhost:8000/ws';
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('Connected to WebSocket Server');
      setConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'init') {
          // receive initial device list from server
          setDevices(message.devices);
        } else if (message.type === 'device_update') {
          // update device state based on server message
          setDevices((prevDevices) =>
            prevDevices.map((device) =>
              device.id === message.device.id ? message.device : device
            )
          );
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket Server. Reconnecting in 3s...');
      setConnected(false);
    
      setTimeout(connect, 3000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      socket.close();
    };

    ws.current = socket;
  }, []);

  useEffect(() => {
    connect();

    // cleanup function to close the WebSocket connection when the component unmounts
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  // function to send command to the backend API
  const sendCommand = useCallback(async (deviceId, command, params = null) => {
    try {
      const response = await fetch(`http://localhost:8000/api/devices/${deviceId}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command, params }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send command');
      }

      const updatedDevice = await response.json();
      
      setDevices((prevDevices) =>
        prevDevices.map((device) =>
          device.id === updatedDevice.id ? updatedDevice : device
        )
      );

      return updatedDevice;
    } catch (error) {
      console.error('Error sending command:', error);
      alert(`Gagal mengontrol perangkat: ${error.message}`);
      throw error;
    }
  }, []);

  return { devices, connected, sendCommand };
}