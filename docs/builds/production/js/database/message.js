require("mongoose").model("Message");var mongoose=require("mongoose"),Message=mongoose.model("Message");module.exports={createMessage:function(e,s){var a=e.body;new Message({sender:a.sender,receiver:a.receiver,message:a.message,time:a.time,date:a.date,fullmessagedate:a.fullmessagedate}).save(function(e){e?(s.status(504),s.end(e)):s.end()})},getMassages:function(e,s){Message.find({},function(e,a){e?(s.status(504),s.end(e)):s.end(JSON.stringify(a))})}};