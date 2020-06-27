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


const tableAdder = (name) => {
    table.add(name);
};

const tableDeleter = (name) => {
    table.delete(name);
};

io.on('connection', function(socket) {
    socket.on('typingUsername', function(typingUsername) {
        if (typingUsername.function != "remove") {
            tableAdder(typingUsername.usernames);
        } else {
            setTimeout(function() {
                tableDeleter(typingUsername.usernames);
            }, 2000);
        }
        //console.log("sending table" + table);

        io.emit('typingUsername', Array.from(table));
        table.clear();
        console.count(table.size);
    });

    socket.on('username', function(username) {
        io.emit('username', username);
    });
    socket.on('message', function(msg) {
        io.emit('message', msg);
    });
});

http.listen(connectPORT, () => {
    console.log(`listening on *: ${connectPORT}`);
});