const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');
const Giveaway = require('./models/giveaway');
// Dummy HTTP server for Render health checks
const http = require('http');
http.createServer((req, res) => res.end('Bot is online!')).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// Load Commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Load Events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(config.mongoURI)
    .then(() => console.log('Connected to MongoDB Atlas!'))
    .catch((error) => console.error('MongoDB connection error:', error));

    client.once('ready', () => {
    // This loop runs every 60,000 milliseconds (1 minute)
    setInterval(async () => {
        const now = new Date();
        
        // Find giveaways that have passed their end time but haven't been completed yet
        const expiredGiveaways = await Giveaway.find({ ended: false, endsAt: { $lt: now } });

        for (const giveaway of expiredGiveaways) {
            try {
                const channel = await client.channels.fetch(giveaway.channelId);
                if (!channel) continue;
                
                const message = await channel.messages.fetch(giveaway.messageId);
                if (!message) continue;

                const reaction = message.reactions.cache.get('🎉');
                if (!reaction) continue;

                const users = await reaction.users.fetch();
                const validEntrants = users.filter(u => !u.bot).map(u => u); // Ignore bots

                if (validEntrants.length === 0) {
                    await channel.send(`Nobody entered the giveaway for **${giveaway.prize}**! 😢`);
                } else {
                    const winners = [];
                    for (let i = 0; i < giveaway.winnersCount; i++) {
                        if (validEntrants.length === 0) break;
                        const randomIndex = Math.floor(Math.random() * validEntrants.length);
                        winners.push(validEntrants.splice(randomIndex, 1)[0]);
                    }

                    const winnerMentions = winners.map(w => `<@${w.id}>`).join(', ');
                    await channel.send(`🎉 Congratulations ${winnerMentions}! You won **${giveaway.prize}**!`);
                }
            } catch (error) {
                console.error("Error completing giveaway:", error);
            }

            // Lock the giveaway in the database so it never runs again
            giveaway.ended = true;
            await giveaway.save();
        }
    }, 60000);
});

client.login(config.token);