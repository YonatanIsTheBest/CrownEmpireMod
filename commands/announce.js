const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Send a stylized announcement embed to a channel')
        // We removed the Administrator requirement here so the role can see it even if they aren't admins
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to send the announcement to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Headline title for the announcement')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The announcement content')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Hex code color (e.g. #D4AF37 for Gold, #2B2D31 for Dark)')
                .setRequired(false)),

    async execute(interaction) {
        // 1. The Role Security Check
        const allowedRoleId = '1533611128284909608';
        
        if (!interaction.member.roles.cache.has(allowedRoleId)) {
            return interaction.reply({ 
                content: '❌ You do not have the required role to use this command.', 
                ephemeral: true // Only the user who tried to run the command will see this rejection
            });
        }

        // 2. Fetch the inputs
        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.getString('title');
        const message = interaction.options.getString('message');
        const colorInput = interaction.options.getString('color') || '#D4AF37';

        // 3. Build the Embed UI
        const embed = new EmbedBuilder()
            .setTitle(`📢  ${title}`)
            .setDescription(message)
            .setColor(colorInput)
            .setTimestamp()
            .setFooter({ 
                text: `${interaction.guild.name} • Official Announcement`, 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            });

        // 4. Send the Announcement
        try {
            await channel.send({ embeds: [embed] });
            await interaction.reply({ 
                content: `✅ Announcement successfully posted in ${channel}!`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: '❌ Failed to send announcement. Make sure I have permission to speak in that channel.', 
                ephemeral: true 
            });
        }
    },
};