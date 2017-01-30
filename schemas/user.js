var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String,
    restaurantName: String,
    id: String,
    waitTime: Number,
    timeOfUpdate: Number,
    restaurantDescription: String,
    profilePicture: String,
    previousTimes: Object,
    currentDay: Object,
    lastWaitTime: Number,
    address: Object
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
