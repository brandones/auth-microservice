const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

mongoose.promise = global.promise

const User = new Schema({
      username: String,
      password: String
})

User.plugin(passportLocalMongoose)

// Export as a mongoose model
module.exports.User = mongoose.model('User', User)
