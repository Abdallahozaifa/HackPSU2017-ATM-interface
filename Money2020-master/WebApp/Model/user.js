// /Model/user.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({
    local: {
        displayName: String,
        interest: mongoose.Schema.Types.Mixed //{interest,weight}
    }
});

userSchema.methods.getInterest = function() {
    var user = this;
    return user.local.interest;
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
