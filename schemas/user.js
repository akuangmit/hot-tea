var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({email_address: String, password:String});  
var User = mongoose.model('User', userSchema); 
module.exports = User; 
