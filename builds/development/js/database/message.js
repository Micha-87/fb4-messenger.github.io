require("mongoose").model("Message");

var mongoose = require("mongoose");
var Message = mongoose.model("Message");

module.exports = {
    createMessage: function (req, res) {
        var message = req.body;
        new Message({ sender: message.sender, receiver: message.receiver, message: message.message, time: message.time ,date: message.date, fullmessagedate: message.fullmessagedate, messageread: message.messageread})
            .save(function (err) {
                if (err) {
                    res.status(504);
                    res.end(err);
                } else {
                    res.end();
                }
            });
    },
    getMassages: function (req, res) {
        Message.find({}, function (err, docs) {
            if (err) {
                res.status(504);
                res.end(err);
            } else {
                /*  for (let i = 0; i < docs.length; i++) {
                      console.log("user:", docs[i].name);
                  }*/
                res.end(JSON.stringify(docs));
            }
        });
    },
    setMessageFromUnreadToRead: function(req, res) {
        // finde die Nachricht
        Message.findById(req.params.id, function (err, message) {

            if (err)
                res.send(err);

            message.messageread = req.body.messageread;  // Ändere den Wert der Variable

            // Speichere die Änderungen
            message.save(function (err) {
                if (err !== null) {
                    res.status(500).json({error: "save failed", err: err});
                    return;
                } else {
                    res.status(201).json(message);
                }
            });
        });
    }
};