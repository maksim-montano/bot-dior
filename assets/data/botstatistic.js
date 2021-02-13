const mongoose = require('mongoose');
const schema = mongoose.Schema({
    botName: String,
    botCommunityString: {type: String, default: ''},

    botServers: {type: Number, default: 0},
    botMembers: {type: Number, default: 0},
    botInteractionUses: {type: Number, default: 0},
});
module.exports = mongoose.model("botstatistics", schema)