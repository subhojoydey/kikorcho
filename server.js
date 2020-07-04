//include libraries,packages
let express = require('express');
let app = express();
let http = require('http').createServer(app);
require('dotenv').config();
let io = require('socket.io')(http);
let connectPORT = process.env.PORT || 3000;
let nameEmitter = "";
let table = new Set();
let val = "";
let item;
let onlineArray = null;
let collection;

//room
//blank form at beginning block
//


const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(process.env.DB_CONN, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err)
        console.log('Error connecting')
    else {
        collection = client.db("master_chat").collection("online_members");
    }
});



//loads the index.html on clients first request to root
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

//serves the public folder
app.use(express.static(__dirname + '/public'));



const addMongo = async(myobj) => {
    await collection.insertOne(myobj);
    console.log("entry added")
}

const deleteMongo = async(myquery) => {
    await collection.deleteOne(myquery);
    console.log("entry deleted")
}

const mongoFinder = async() => {
    onlineArray = await collection.find({}).toArray();
    io.emit('is_online', onlineArray);
    console.log(onlineArray);
}


io.on('connection', function(socket) {
    socket.on('is_online', async(onlinePrompt) => {
        socket.username = onlinePrompt;
        var randomColor = Math.floor(Math.random() * 16777215).toString(16);
        let myobj = { _id: socket.id, name: onlinePrompt, color: randomColor };
        await addMongo(myobj);
        await mongoFinder();
    })

    socket.on('disconnect', async function(username) {
        let myquery = { _id: socket.id };
        await deleteMongo(myquery);
        await mongoFinder();
    })

    socket.on('typingFunction', function(typingFunction) {
        if (typingFunction.function != "remove") {
            table.add(typingFunction.usernames);
        } else {
            table.delete(typingFunction.usernames);
        }
        io.emit('typingFunction', Array.from(table));
    });

    socket.on('message', async function(msg) {
        var colorFinder = await collection.find({ _id: socket.id }).toArray();
        io.emit('message', {
            'usernames': msg.usernames,
            'response': msg.response,
            'color': colorFinder[0].color
        });
    });
});

http.listen(connectPORT, () => {
    console.log(`listening on *: ${connectPORT}`);
});