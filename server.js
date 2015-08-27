var server = (function() {
    const ARGS = require('minimist')(process.argv.slice(2));
    const CLIENT_DIR = 'client';
    const CLIENT_INDEX = 'index.html';
    const CLIENT_PORT = 8000;
    const MIME_TYPES = {
        css: 'text/css',
        html: 'text/html',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        js: 'text/javascript',
        png: 'image/png',
        svg: 'image/svg+xml',
        svgz: 'image/svg+xml',
        ttf: 'application/font-sfnt',
        woff: 'application/font-woff',
        woff2: 'application/font-woff2'
    };
    
    var clientDir = ARGS._[0] || __dirname + '/' + CLIENT_DIR;
    
    var fs = require('fs');
    var http = require('http').createServer(httpHandler);
    var io = require('socket.io')(http);
    var path = require('path');
    var running = false;
    var url = require('url');
    
    function getMimeType(forFileName) {
        var fileExt = path.extname(forFileName).split('.')[1];
        var mimeType = MIME_TYPES[fileExt];
        if(!mimeType) {
            return '';
        }
        return {
            'Content-Type': mimeType
        };
    }
    
    function httpHandler(req, res) {
        var uri = url.parse(req.url).pathname;
        uri = (uri === '/') ? uri + CLIENT_INDEX : uri;
        var filename = path.join(clientDir, uri);
        fs.exists(filename, function(exists) {
            if(!exists) {
                var msg404 = '404 ' + filename + ' NOT FOUND\n';
                console.log(msg404);
                res.writeHead(404, {'Content-Type': 'text/plain'});
                return res.end(msg404);
            }
            res.writeHead(200, getMimeType(filename));
            fs.createReadStream(filename).pipe(res);
        });
    }
    
    function start() {
        if(running) {
            return;
        }
        running = true;
        var startMsg = 'Server listening on localhost:' + CLIENT_PORT;
        http.listen(CLIENT_PORT);
        io.on('connection', function(socket) {
            process.on('message', function(msg) {
                socket.emit('notification', msg);
            });
        });
        console.log(startMsg);
        startMsg = null;
    }
    
    return {
        start: start
    };
})();

server.start();