//web socket server

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let clients = new Map();
let nextClientId = 1;

wss.on('connection', (ws) => {
  const clientId = `Client-${nextClientId++}`;
  console.log(`${clientId} connected`);
  

  clients.set(ws, { 
    id: clientId,
    number: null 
  });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (typeof data.number === 'number') {
        // Update the client's number while preserving ID
        clients.set(ws, { 
          ...clients.get(ws), 
          number: data.number 
        });
        broadcastUpdates();
      }
    } catch (err) {
      console.error('Message error:', err);
    }
  });

  ws.on('close', () => {
    console.log(`${clients.get(ws).id} disconnected`);
    clients.delete(ws);
    broadcastUpdates();
  });
});

function broadcastUpdates() {
  const activeClients = Array.from(clients.entries())
    .filter(([ws]) => ws.readyState === WebSocket.OPEN)
    .map(([ws, clientData]) => ({
      ws,
      ...clientData
    }));

  // Prepare updates for each client
  const updates = new Map();
  
  activeClients.forEach(current => {
    const closeClients = activeClients
      .filter(other => 
        other.id !== current.id && 
        Math.abs(other.number - current.number) < 10
      )
      .map(c => c.id);
    
    updates.set(current.ws, closeClients);
  });

  console.log(`Broadcasting to ${activeClients.length} clients`);
  updates.forEach((closeClients, ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ closeClients }));
      } catch (err) {
        console.error(`Error sending to ${clients.get(ws).id}:`, err);
      }
    }
  });
}

console.log('WebSocket server running on ws://localhost:8080');