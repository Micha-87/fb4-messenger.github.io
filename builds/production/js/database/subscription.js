require("mongoose").model("Subscription");var mongoose=require("mongoose"),Subscription=mongoose.model("Subscription");module.exports={addSubscription:function(n,i){var o=n.body;Subscription.find({},function(n,o){n?(i.status(504),i.end(n)):i.end(JSON.stringify(o))}).then(function(n){var e=!1;n.forEach(function(n){n.endpoint===o.endpoint&&(e=!0)}),e||new Subscription({endpoint:o.endpoint,expirationTime:o.expirationTime,keys:o.keys}).save(function(n){n?(i.status(504),i.end(n)):i.end()})})},getSubscriptions:function(n,i){Subscription.find({},function(n,o){n?(i.status(504),i.end(n)):i.end(JSON.stringify(o))})}};