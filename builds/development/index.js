/**
 * Created by Micha on 11.10.2017.
 */
//Variablen
const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");//Komprimiert HTTP-Requests und -Responses. Erhöht die Performance bei einer 3g Verbindung

/*let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server);
server.listen(3000);*/

//Serverimplementierung
let app = express();
let server = app.listen(3000);
let io = require("socket.io").listen(server);


//Datenbankzugriff
let db = require("./js/database/db");
let user = require("./js/database/user");
let message = require("./js/database/message");
let pushkey = require("./js/database/pushkey");
let subscription = require("./js/database/subscription");

app.use(compression());

//HTTP-Verkehr zu https umleiten
/*if(process.env.NODE_ENV === "production") {
    // Redirect http to https
    app.enable('trust proxy');
    app.use(function(req, res, next) {
        if (req.secure){
            return next();
        }
        res.redirect("https://" + req.headers.host + req.url);
    });
}*/

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Die statische Middleware behandelt den Inhalt eines Verzeichnisses.
//In diesem Fall wird das Verzeichnis 'root' bereitgestellt und alle Inhalte (HTML, CSS, JavaScript) sind verfügbar.
app.use(express.static(__dirname + "/"));

let connectedUsers = [];

//Socket lauschen auf Ereignisse
io.sockets.on("connection", function (socket) {
    socket.on("message", function (data) {
        io.emit("add-message", data);
    });

    socket.on("connectedUser", function (data) {
        let connectedUser =[data.connectedUser, data.socketId];
        let exist = false;

        if(connectedUsers.length > 0)
        {
            connectedUsers.forEach(function (client) {
               if(client[0] == connectedUser[0])
               {
                   exist = true;
               }
            });
            if(!exist){
                connectedUsers.push(connectedUser);
            }
        }
        else{
            connectedUsers.push(connectedUser);
        }
        io.emit("connectedUsers", connectedUsers);
    });

    /* socket.on("add-user", function(data){
         clients[data.nickname] = {
             "socket": socket.id
         };
         console.log(clients);
     });*/

    //Wenn neuer user sich registriert hat, wird eine Nachricht an HomeController gischickt und dieser wird aktulisiert
    socket.on("db-changes", function (data) {
        io.emit("db-changes-register", data);
    })

    //Wenn User seine Daten ändern müssen diese bei anderen Nutzer in Browsern auch aktualisiert werden
    socket.on("user-nickname-changes", function (data) {
        io.emit("user-nickname-changes-everywhere", data);
    })
    socket.on("user-name-changes", function (data) {
        io.emit("user-name-changes-everywhere", data);
    })
    socket.on("user-email-changes", function (data) {
        io.emit("user-email-changes-everywhere", data);
    })
    socket.on("user-password-changes", function (data) {
        io.emit("user-password-changes-everywhere", data);
    })

    socket.on('disconnect', function(){
        const index = connectedUsers.indexOf(socket.id);
        connectedUsers.splice(index, 1);
    });
});


//bodyParser setup
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//REST-Zugriffe
app.post("/users/", user.createUsers);
app.put("/users/loggedin/:id", user.updateUserState);
app.put("/users/updateNickname/:id", user.updateUserNickname);
app.put("/users/updateName/:id", user.updateUserName);
app.put("/users/updateEmail/:id", user.updateUserEmail);
app.put("/users/updatePassword/:id", user.updateUserPassword);
app.get("/users/", user.seeResults);
app.get("/users/getByEmail/:email", user.findByEmail);
app.get("/users/getByNickname/:nickname", user.findByNickname);
app.delete("/users/:id", user.delete);

app.post("/messages/", message.createMessage);
app.get("/messages/", message.getMassages);
app.put("/messages/messageRead/:id", message.setMessageFromUnreadToRead);

app.get("/pushkeys/", pushkey.getPushKeys);

app.post("/add-subscription/", subscription.addSubscription);
app.get("/subscriptions/", subscription.getSubscriptions);


//Damit die Routing-Seiten sich reloaden
app.get("*", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

/*
server.listen(3000, function () {
    console.log("Server runing");
});*/
