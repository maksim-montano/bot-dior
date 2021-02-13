const mongoose = require('mongoose');
const schema = mongoose.Schema({
    userID: String,
    guildID: String,
    coins: { type: Number, default: 0 },
});
module.exports = mongoose.model("Users", schema)