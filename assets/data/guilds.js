const mongoose = require('mongoose');
const schema = mongoose.Schema({
    guildID: String,
    ownerID: String,
    prefix: {type: String, default: '/'},
    guildMembersSize: {type: Number, default: 0}
});
module.exports = mongoose.model("guilds", schema)