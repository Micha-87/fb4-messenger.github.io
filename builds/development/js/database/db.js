const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

var User = new mongoose.Schema({
    nickname: {type: String},
    name: {type: String},
    email: {type: String},
    password: {type: String},
    loggedin: {type: Boolean, default: false}
});
mongoose.model("User", User);

var Message = new mongoose.Schema({
    sender: {type: String},
    receiver: {type: String},
    message: {type: String},
    time: {type: String},
    date: {type: String},
    fullmessagedate:{type: String},
    messageread: {type: Boolean}
});

mongoose.model("Message", Message);

var Pushkeys = new mongoose.Schema({
    GCMAPIKey: {type: String},
    subject: {type: String},
    publicKey: {type: String},
    privateKey: {type: String}
});

mongoose.model("Pushkeys", Pushkeys);

var Subscription = new mongoose.Schema({
    endpoint: {type: String},
    expirationTime: {type: String},
    keys: {p256dh: {type: String}, auth: {type: String}}
});

mongoose.model("Subscription", Subscription);

//Mongoose Connection
mongoose.connect("mongodb://127.0.0.1/chat_db", {
    useMongoClient: true
});
