const mongoose = require('mongoose');
const schema = mongoose.Schema({
    userID: String,
    guildID: String,
    coins: String,
});
module.exports = mongoose.model("users", schema)