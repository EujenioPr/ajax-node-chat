const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: String,
    nickname: {
        type: String,
        unique: true
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;