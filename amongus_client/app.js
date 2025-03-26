//will use flutter app for this and will send longitudes and latitudes to the server instead of a single no

const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    setInterval(() => {
        const randomNumber = Math.floor(Math.random() * 100);
        console.log('Sending:', randomNumber);
        ws.send(JSON.stringify({ number: randomNumber }));
    }, 1000);
});

ws.on('message', (data) => {
    console.log('Received:', data.toString());
});
