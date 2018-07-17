const connection = require('../db/dbconnect');
const Repository = require('./Repository');
const User = require('../models/user');

class UserRepository extends Repository {
    constructor() {
        super();
        this.model = User;
    }
    find(cb) {
        User.find().limit(100).exec((err, data) => {
            cb(err, data);
        });
    }
    createUser(user, cb) {
        User.create({ name: user.name, nickname: user.nickname }, (err, data) => {
            if(!err)
                console.log('User created!');
                
            cb(err, data);
        });
    }
}

module.exports = new UserRepository();