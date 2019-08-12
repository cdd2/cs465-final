let mongoose = require('mongoose');

// User Schema
let userSchema = mongoose.Schema({
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

let User = module.exports = mongoose.model('User', userSchema);