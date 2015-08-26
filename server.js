var server = require('http').createServer(handler);
var io = require('socket.io').listen(server);
var fs = require('fs');

server.listen(8000);

console.log('server listening on localhost:8000');

function handler(req, res) {
    fs.readFile(__dirname + '/client/index.html', function(err, data) {
        if (err) {
            console.log(err);
            res.writeHead(500);
            return res.end('Error loading client view');
        }
        res.writeHead(200);
        res.end(data);
    });
}

io.sockets.on('connection', function(socket) {
    process.on('message', function(msg) {
        socket.volatile.emit('notification', msg);
    });
});