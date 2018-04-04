require("mongoose").model("Subscription");

var mongoose = require("mongoose");
var Subscription = mongoose.model("Subscription");

module.exports = {
    addSubscription: function (req, res) {
        var subscription = req.body;
        //Damit die gleiche Subscription nicht mehrfach gespeichert wird
        Subscription.find({}, function (err, docs) {
            if (err) {
                res.status(504);
                res.end(err);
            } else {
                res.end(JSON.stringify(docs));
            }
        }).then(function (subscriptions) {
            var existingSubscription = false;
            subscriptions.forEach(function (sub) {
                if(sub.endpoint === subscription.endpoint) {
                    existingSubscription = true;
                }
            });
            if(existingSubscription) {
                return;
            }

            new Subscription({  endpoint: subscription.endpoint, expirationTime: subscription.expirationTime, keys: subscription.keys})
                .save(function (err) {
                    if (err) {
                        res.status(504);
                        res.end(err);
                    } else {
                        res.end();
                    }
                });
        });
    },
    getSubscriptions: function (req, res) {
        Subscription.find({}, function (err, docs) {
            if (err) {
                res.status(504);
                res.end(err);
            } else {
                res.end(JSON.stringify(docs));
            }
        });
    }
};