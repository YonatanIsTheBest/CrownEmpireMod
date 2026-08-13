const { Schema, model } = require('mongoose');

const giveawaySchema = new Schema({
    messageId: { type: String, required: true },
    channelId: { type: String, required: true },
    prize: { type: String, required: true },
    endsAt: { type: Date, required: true },
    winnersCount: { type: Number, required: true, default: 1 },
    ended: { type: Boolean, default: false }
});

module.exports = model('Giveaway', giveawaySchema);