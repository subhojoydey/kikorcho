//include libraries,packages
let express = require('express');
let app = express();
let http = require('http').createServer(app);
require('dotenv').config();
let io = require('socket.io')(http);
io.eio.pingTimeout = 300000; // 2 minutes
io.eio.pingInterval = 5000; // 5 seconds
let connectPORT = process.env.PORT || 3000;
let nameEmitter = "";
let table = new Set();
let val = "";
let item;
let onlineArray = [];
let collection1, collection2;
let roomGetter;


//room
//blank form at beginning block
//

//setup mongodb
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(process.env.DB_CONN, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err)
        console.log('Error connecting')
    else {
        collection1 = client.db("master_chat").collection("online_members");
        collection2 = client.db("master_chat").collection("room_database");
    }
});



//loads the index.html on clients first request to root
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

//serves the public folder
app.use(express.static(__dirname + '/public'));


//adds to mongodb
const addMongo = async(myobj, collectionChoice) => {
    if (collectionChoice == 1) {
        await collection1.insertOne(myobj);
    } else if (collectionChoice == 2) {
        await collection2.insertOne(myobj);
    }
}

//deletes from mongodb
const deleteMongo = async(myquery, collectionChoice) => {
    if (collectionChoice == 1) {
        roomGetter = await collection1.find(myquery).toArray();
        if (roomGetter.length != 0)
            await collection1.deleteOne(myquery);
    } else if (collectionChoice == 2) {
        roomGetter = await collection2.find(myquery).toArray();
        if (roomGetter.length != 0)
            await collection2.deleteOne(myquery);
    }
}

//finds in mongodb
const nametableFinder = async(room_name) => {
    onlineArray = [];
    await roomnameFinder(room_name);
    for (var i = 0; i < roomGetter.length; i++) {
        temp = await collection1.find({ _id: roomGetter[i]._id }).toArray();
        onlineArray = onlineArray.concat(temp);
    }
    io.in(room_name).emit('is_online', onlineArray);
}

const roomidFinder = async(room_id) => {
    roomGetter = await collection2.find({ _id: room_id }).toArray();
}

const roomnameFinder = async(room_name) => {
    roomGetter = await collection2.find({ name: room_name }).toArray();
}

//start connection
io.on('connection', function(socket) {
    io.eio.pingTimeout = 300000; // 2 minutes
    io.eio.pingInterval = 5000; // 5 seconds

    //join or create room
    socket.on('roomjoin', async(roomDetails) => {
        if (roomDetails.purpose == 2) {
            await roomnameFinder(roomDetails.name);
            if (roomGetter.length != 0) {
                await socket.emit('nameChecker', 1);
            } else if (roomGetter.length == 0) {
                let myobj = { _id: socket.id, name: roomDetails.name, password: roomDetails.password, purpose: roomDetails.purpose };
                socket.emit('nameChecker', 2);
                await addMongo(myobj, 2);
                socket.join(roomDetails.name);
            }
        } else if (roomDetails.purpose == 1) {
            await roomnameFinder(roomDetails.name);
            if (roomGetter.length != 0) {
                if (roomDetails.password == roomGetter[0].password) {
                    socket.emit('passcheck', 1);
                    let myobj = { _id: socket.id, name: roomDetails.name, password: roomDetails.password, purpose: roomDetails.purpose };
                    await addMongo(myobj, 2);
                    socket.join(roomDetails.name);
                } else {
                    await socket.emit('passcheck', 2);
                }
            } else
                await socket.emit('passcheck', 3);
        }
    })

    //send online pop up
    socket.on('is_online', async(onlinePrompt) => {
        var randomColor = Math.floor(Math.random() * 16777215).toString(16);
        let myobj = { _id: socket.id, name: onlinePrompt, color: randomColor };
        await roomidFinder(socket.id);
        await addMongo(myobj, 1);
        await nametableFinder(roomGetter[0].name);
    })

    //disconnect pleasentries
    socket.on('disconnect', async function() {
        let myquery = { _id: socket.id };
        await roomidFinder(socket.id);
        await deleteMongo(myquery, 1);
        await deleteMongo(myquery, 2);
        if (roomGetter.length != 0)
            await nametableFinder(roomGetter[0].name);
    })

    //send typing data
    socket.on('typingFunction', async function(typingFunction) {
        if (typingFunction.function != "remove") {
            table.add(typingFunction.usernames);
        } else {
            table.delete(typingFunction.usernames);
        }
        await roomidFinder(socket.id);
        io.in(roomGetter[0].name).emit('typingFunction', Array.from(table));
    });

    //send message
    socket.on('message', async function(msg) {
        var colorFinder = await collection1.find({ _id: socket.id }).toArray();
        await roomidFinder(socket.id);
        io.in(roomGetter[0].name).emit('message', {
            'usernames': msg.usernames,
            'response': msg.response,
            'color': colorFinder[0].color
        });
    });
});

http.listen(connectPORT, () => {
    console.log(`listening on *: ${connectPORT}`);
});