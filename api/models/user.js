const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose')

const Schema = mongoose.Schema;

const UserSchema = new Schema({});

UserSchema.plugin(passportLocalMongoose);//it will add username and password (hash and salt)

module.exports = mongoose.model('User', UserSchema);
