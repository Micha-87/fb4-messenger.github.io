require("mongoose").model("User");

var mongoose = require("mongoose");
var User = mongoose.model("User");
var Message = mongoose.model("Message");

module.exports = {
    createUsers: function (req, res) {
        var person = req.body;
        new User({ nickname: person.nickname, name: person.name, email: person.email, password: person.password})
            .save(function (err) {
                if (err) {
                    res.status(504);
                    res.end(err);
                } else {
                    res.end();
                }
            });
    },
    updateUserState: function(req, res) {
        // finde den benötigten User
        User.findById(req.params.id, function (err, user) {

            if (err)
                res.send(err);

            user.loggedin = req.body.loggedin;  // Ändere den Wert der Variable

            // Speichere die Änderungen
            user.save(function (err) {
                if (err !== null) {
                    res.status(500).json({ error: "save failed", err: err});
                    return;
                } else {
                    res.status(201).json(user);
                }

            });
        });
    },
    updateUserNickname: function(req, res) {
        // finde den benötigten User
        User.findById(req.params.id, function (err, user) {
            if (err)
                res.send(err);

            var usernickname = user.nickname;
            user.nickname = req.body.nickname;  // Ändere den Wert der Variable

            // Speichere die Änderungen
            user.save(function (err) {
                if (err !== null) {
                    res.status(500).json({ error: "save failed", err: err});
                    return;
                } else {
                    res.status(201).json(user);
                };

            });
            Message.find({}, function (err, messages) {
                if (err) {
                    res.status(504);
                    res.end(err);
                } else {
                     for (let i = 0; i < messages.length; i++) {
                         if(messages[i].sender === usernickname)
                         {
                             messages[i].sender = user.nickname;
                             messages[i].save(function (err) {
                                 if (err !== null) {
                                     res.status(500).json({ error: "save failed", err: err});
                                     return;
                                 }
                             });
                         }
                         else if(messages[i].receiver === usernickname)
                         {
                             messages[i].receiver = user.nickname;
                             messages[i].save(function (err) {
                                 if (err !== null) {
                                     res.status(500).json({ error: "save failed", err: err});
                                     return;
                                 }
                             });
                         }
                      }
                }
            });
        });
    },
    updateUserName: function(req, res) {
        // finde den benötigten User
        User.findById(req.params.id, function (err, user) {

            if (err)
                res.send(err);

            user.name = req.body.name;  // Ändere den Wert der Variable

            // Speichere die Änderungen
            user.save(function (err) {
                if (err !== null) {
                    res.status(500).json({ error: "save failed", err: err});
                    return;
                } else {
                    res.status(201).json(user);
                };
            });
        });
    },
    updateUserEmail: function(req, res) {
        // finde den benötigten User
        User.findById(req.params.id, function (err, user) {

            if (err)
                res.send(err);

            user.email = req.body.email;  // Ändere den Wert der Variable

            // Speichere die Änderungen
            user.save(function (err) {
                if (err !== null) {
                    res.status(500).json({ error: "save failed", err: err});
                    return;
                } else {
                    res.status(201).json(user);
                };
            });
        });
    },
    updateUserPassword: function(req, res) {
        // finde den benötigten User
        User.findById(req.params.id, function (err, user) {

            if (err)
                res.send(err);

            user.password = req.body.password;  // Ändere den Wert der Variable

            // Speichere die Änderungen
            user.save(function (err) {
                if (err !== null) {
                    res.status(500).json({ error: "save failed", err: err});
                    return;
                } else {
                    res.status(201).json(user);
                };
            });
        });
    },
    seeResults: function (req, res) {
        User.find({}, function (err, docs) {
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
    findByEmail: function (req, res) {
        User.find({email: req.params.email}, function (err, docs) {
            if (err) {
                res.status(504);
                res.end(err);
            } else {
                res.end(JSON.stringify(docs));
            }
        });
    },
    findByNickname: function (req, res) {
        User.find({nickname: req.params.nickname}, function (err, docs) {
            if (err) {
                res.status(504);
                res.end(err);
            } else {
                res.end(JSON.stringify(docs));
            }
        });
    },
    delete: function( req, res) {
        User.find({ _id: req.params.id}, function(err) {
            if(err) {
                req.status(504);
                req.end();
                console.log(err);
            }
        }).remove(function (err) {
            console.log(err);
            if (err) {
                res.end(err);
            } else {
                res.end();
            }
        });
    }
};