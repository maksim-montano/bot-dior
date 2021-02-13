const mongoose = require('mongoose');
const schema = mongoose.Schema({
    CreatorFam: String,
    guildID: String,
    FamilyName: String,
    FamilyChannel: String,
    FamilyRole: String,

    FamilyReputation: {type: Number, default: 0},
    FamilyMembers: {type: Array, default: []},
    FamilyMembersDescr: {type: Array, default: []},
    FamilyZamsDescr: {type: Array, default: []},
    FamilyZams: {type: Array, default: []},
});
module.exports = mongoose.model("Family", schema)