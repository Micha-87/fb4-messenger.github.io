require("mongoose").model("Pushkeys");

var mongoose = require("mongoose");
var Pushkeys = mongoose.model("Pushkeys");

module.exports = {
    getPushKeys: function (req, res) {
        Pushkeys.find({}, function (err, docs) {
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
    }
};