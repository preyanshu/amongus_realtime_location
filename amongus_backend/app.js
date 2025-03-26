const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let clients = new Map(); 
let clientList = []; 

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (typeof data.number === 'number') {
            clients.set(ws, data.number);
            updateClientList();
            debounceCheckAndBroadcast();
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
        updateClientList();
    });
});

// Updates the sorted array for optimized check
function updateClientList() {
    clientList = Array.from(clients.entries()).map(([ws, num]) => ({ ws, num }));
    clientList.sort((a, b) => a.num - b.num);
}

// Debouncing to prevent too many checks
let debounceTimeout;
function debounceCheckAndBroadcast() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(checkAndBroadcast, 500);
}

// Optimized check using two-pointer approach
function checkAndBroadcast() {
    const resultMap = new Map(); 
    let i = 0, j = 0;
    while (i < clientList.length) {
        resultMap.set(clientList[i].ws, []);

        while (j < clientList.length && clientList[j].num - clientList[i].num < 10) {
            if (i !== j) {
                resultMap.get(clientList[i].ws).push(`Client-${j + 1}`);
            }
            j++;
        }
        i++;
    }

    // Send updates
    resultMap.forEach((closeClients, ws) => {
        ws.send(JSON.stringify({ closeClients }));
    });
}

console.log('WebSocket server running on ws://localhost:8080');
