// var mongoose = require('mongoose');
// var passportLocalMongoose = require('passport-local-mongoose');
// var userSchema = new mongoose.Schema({email_address: String, password:String});  
// var User = mongoose.model('User', userSchema); 
// userSchema.plugin(passportLocalMongoose);
// module.exports = User; 

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String,
    waitTime: Number
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
