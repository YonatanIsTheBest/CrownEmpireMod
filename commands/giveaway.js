const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Giveaway = require('../models/Giveaway'); // Pull in our database schema

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Start a giveaway in the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
        const prize = interaction.options.getString('prize');
        const durationMinutes = interaction.options.getInteger('duration');
        const winnerCount = interaction.options.getInteger('winners') || 1;
        
        const endsAt = new Date(Date.now() + durationMinutes * 60 * 1000);

        const giveawayEmbed = new EmbedBuilder()
            .setTitle(`🎉 **GIVEAWAY: ${prize}** 🎉`)
            .setDescription(`React with 🎉 to enter!\n\n**Ends:** <t:${Math.floor(endsAt.getTime() / 1000)}:R>\n**Hosted by:** ${interaction.user}\n**Winners:** ${winnerCount}`)
            .setColor('#5865F2')
            .setTimestamp(endsAt)
            .setFooter({ text: 'Giveaway ends' });

        await interaction.reply({ content: 'Giveaway started!', ephemeral: true });
        const giveawayMessage = await interaction.channel.send({ embeds: [giveawayEmbed] });
        await giveawayMessage.react('🎉');

        // SAVE TO MONGODB INSTEAD OF A TIMER
        await Giveaway.create({
            messageId: giveawayMessage.id,
            channelId: interaction.channel.id,
            prize: prize,
            endsAt: endsAt,
            winnersCount: winnerCount,
            ended: false
        });
    },
};