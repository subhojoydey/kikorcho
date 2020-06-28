//include libraries,packages
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var connectPORT = process.env.PORT || 3000;
var nameEmitter = "";
let table = new Set();
var val = "";
var item;


//loads the index.html on clients first request to root
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

//serves the public folder
app.use(express.static(__dirname + '/public'));



io.on('connection', function(socket) {
    socket.on('typingFunction', function(typingFunction) {
        if (typingFunction.function != "remove") {
            table.add(typingFunction.usernames);
        } else {
            table.delete(typingFunction.usernames);
        }
        io.emit('typingFunction', Array.from(table));
    });

    socket.on('message', function(msg) {
        io.emit('message', msg);
    });
});

http.listen(connectPORT, () => {
    console.log(`listening on *: ${connectPORT}`);
});