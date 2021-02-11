const mongoose = require('mongoose');
const schema = mongoose.Schema({
    guildID: String,
    ownerID: String,
    prefix: String,
});
module.exports = mongoose.model("guilds", schema)