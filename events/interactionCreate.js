const { EmbedBuilder } = require('discord.js');
const Giveaway = require('../models/Giveaway');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        
        // --- 1. HANDLE NORMAL SLASH COMMANDS ---
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
                }
            }
        } 
        
        // --- 2. HANDLE MODAL SUBMISSIONS (THE FORM) ---
        else if (interaction.isModalSubmit()) {
            if (interaction.customId === 'giveaway_modal') {
                
                // Extract the text from the form fields
                const durationStr = interaction.fields.getTextInputValue('duration');
                const winnersStr = interaction.fields.getTextInputValue('winners');
                const prize = interaction.fields.getTextInputValue('prize');
                const description = interaction.fields.getTextInputValue('description');

                // Convert the text numbers into actual integers
                const durationMinutes = parseInt(durationStr);
                const winnerCount = parseInt(winnersStr);

                // Safety check: Make sure they typed real numbers
                if (isNaN(durationMinutes) || isNaN(winnerCount)) {
                    return interaction.reply({ content: '❌ Duration and Number of Winners must be valid numbers!', ephemeral: true });
                }

                // Calculate the end time
                const endsAt = new Date(Date.now() + durationMinutes * 60 * 1000);

                // Build the description text, injecting the optional description if they wrote one
                let embedDesc = `React with 🎉 to enter!\n\n**Ends:** <t:${Math.floor(endsAt.getTime() / 1000)}:R>\n**Hosted by:** ${interaction.user}\n**Winners:** ${winnerCount}`;
                if (description) {
                    embedDesc = `${description}\n\n` + embedDesc;
                }

                // Build and send the Embed
                const giveawayEmbed = new EmbedBuilder()
                    .setTitle(`🎉 **GIVEAWAY: ${prize}** 🎉`)
                    .setDescription(embedDesc)
                    .setColor('#5865F2')
                    .setTimestamp(endsAt)
                    .setFooter({ text: 'Giveaway ends' });

                await interaction.reply({ content: 'Giveaway started!', ephemeral: true });
                const giveawayMessage = await interaction.channel.send({ embeds: [giveawayEmbed] });
                await giveawayMessage.react('🎉');

                // Save to MongoDB
                await Giveaway.create({
                    messageId: giveawayMessage.id,
                    channelId: interaction.channel.id,
                    prize: prize,
                    endsAt: endsAt,
                    winnersCount: winnerCount,
                    ended: false
                });
            }
        }
    },
};