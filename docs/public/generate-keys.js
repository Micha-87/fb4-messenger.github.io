//Noch in Entwicklung
let webpush = require("web-push");
let vapidKeys = webpush.generateVAPIDKeys();

let MongoClient = require("mongodb").MongoClient;

let pushKeysContents = {
    GCMAPIKey: "AAAA5bt2PQk:APA91bH-2rBZ1U6uG2GHiwCraSzlqvvuiI_nKdvbSep134HaTkRJLdyxOJzpuvlHPqYx40IrKP6K_1wpqL7crYTIfOdT-9RpqJ9ne5bPbUX3DDL7AFkHOOJa3SrZFhDGutdo7hH2LrRn",
    subject: "mailto:mishast87@googlemail.com",
    publicKey: vapidKeys.publicKey,
    privateKey: vapidKeys.privateKey
};

MongoClient.connect("mongodb://localhost/chat_db", function(err, db) {
    if (err) throw err;

    db.collection("pushkeys").deleteMany({});
    db.collection("pushkeys").insertOne(pushKeysContents, function(err, res) {
        if (err) throw err;
        db.close();
    });
});


