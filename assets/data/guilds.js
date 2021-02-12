const mongoose = require('mongoose');
const schema = mongoose.Schema({
    guildID: String,
    ownerID: String,
    prefix: {type: String, default: '/'}
});
module.exports = mongoose.model("guilds", schema)