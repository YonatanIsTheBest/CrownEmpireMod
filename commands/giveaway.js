const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Start a giveaway in the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Restricts to admins
        .addStringOption(option =>
            option.setName('prize')
                .setDescription('What are you giving away?')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration of the giveaway in minutes')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('winners')
                .setDescription('Number of winners (default: 1)')
                .setRequired(false)),

    async execute(interaction) {
        // 1. Fetch the inputs
        const prize = interaction.options.getString('prize');
        const durationMinutes = interaction.options.getInteger('duration');
        const winnerCount = interaction.options.getInteger('winners') || 1;
        
        // Convert minutes to milliseconds for the timer
        const durationMs = durationMinutes * 60 * 1000;
        
        // Calculate the exact timestamp when the giveaway ends (for the Discord UI)
        const endsAt = new Date(Date.now() + durationMs);

        // 2. Build the Giveaway Embed
        const giveawayEmbed = new EmbedBuilder()
            .setTitle(`🎉 **GIVEAWAY: ${prize}** 🎉`)
            .setDescription(`React with 🎉 to enter!\n\n**Ends:** <t:${Math.floor(endsAt.getTime() / 1000)}:R>\n**Hosted by:** ${interaction.user}\n**Winners:** ${winnerCount}`)
            .setColor('#5865F2') // Discord Blurple
            .setTimestamp(endsAt)
            .setFooter({ text: 'Giveaway ends' });

        // 3. Send the Giveaway Message
        await interaction.reply({ content: 'Giveaway started!', ephemeral: true });
        const giveawayMessage = await interaction.channel.send({ embeds: [giveawayEmbed] });
        
        // Add the initial reaction
        await giveawayMessage.react('🎉');

        // 4. Start the Timer
        setTimeout(async () => {
            try {
                // Fetch the message again to get the updated reaction count
                const fetchedMessage = await interaction.channel.messages.fetch(giveawayMessage.id);
                const reaction = fetchedMessage.reactions.cache.get('🎉');
                
                // Get all users who reacted
                const users = await reaction.users.fetch();
                
                // Filter out the bot itself from the entrants
                const validEntrants = users.filter(u => !u.bot).map(u => u);

                if (validEntrants.length === 0) {
                    return interaction.channel.send(`Nobody entered the giveaway for **${prize}**! 😢`);
                }

                // Randomly select winners
                const winners = [];
                for (let i = 0; i < winnerCount; i++) {
                    if (validEntrants.length === 0) break;
                    const randomIndex = Math.floor(Math.random() * validEntrants.length);
                    winners.push(validEntrants.splice(randomIndex, 1)[0]);
                }

                // Announce the winners
                const winnerMentions = winners.map(w => `<@${w.id}>`).join(', ');
                interaction.channel.send(`🎉 Congratulations ${winnerMentions}! You won **${prize}**!`);
                
            } catch (error) {
                console.error('Error ending giveaway:', error);
            }
        }, durationMs);
    },
};