const http = require('http');

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.url === '/health') {
        res.writeHead(200);
        res.end(JSON.stringify({ 
            status: 'OK', 
            message: 'Basic HTTP server working',
            timestamp: new Date().toISOString()
        }));
    } else if (req.url === '/') {
        res.writeHead(200);
        res.end(JSON.stringify({ 
            message: 'Basic API server',
            endpoints: ['/health', '/']
        }));
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ 
            error: 'Not found',
            path: req.url
        }));
    }
});

module.exports = server;
