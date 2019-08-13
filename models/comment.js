let mongoose = require('mongoose');

// User Schema
let commentSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
});

let Comment = module.exports = mongoose.model('Comment', commentSchema);