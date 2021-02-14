const mongoose = require('mongoose');
const schema = mongoose.Schema({
    userID: String,
    guildID: String,
    coins: { type: Number, default: 0 },

    rank: {type: Number, default: 1},
    exp: {type: Number, default: 1},

    needleExp: {type: Number, default: 150}
});
module.exports = mongoose.model("Users", schema)