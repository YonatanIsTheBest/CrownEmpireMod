const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Open the giveaway creation form')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // 1. Create the Modal (The Popup Window)
        const modal = new ModalBuilder()
            .setCustomId('giveaway_modal')
            .setTitle('Create a Giveaway');

        // 2. Create the Text Input Fields
        const durationInput = new TextInputBuilder()
            .setCustomId('duration')
            .setLabel('Duration (in minutes)')
            .setPlaceholder('Ex: 10')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const winnersInput = new TextInputBuilder()
            .setCustomId('winners')
            .setLabel('Number of Winners')
            .setValue('1') // Sets a default value
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const prizeInput = new TextInputBuilder()
            .setCustomId('prize')
            .setLabel('Prize')
            .setPlaceholder('What are you giving away?')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descInput = new TextInputBuilder()
            .setCustomId('description')
            .setLabel('Description')
            .setPlaceholder('Optional details about the giveaway')
            .setStyle(TextInputStyle.Paragraph) // Makes it a larger text box
            .setRequired(false);

        // 3. Package the inputs into Action Rows (Discord requires 1 input per row)
        const row1 = new ActionRowBuilder().addComponents(durationInput);
        const row2 = new ActionRowBuilder().addComponents(winnersInput);
        const row3 = new ActionRowBuilder().addComponents(prizeInput);
        const row4 = new ActionRowBuilder().addComponents(descInput);

        // 4. Add the rows to the modal and show it to the user
        modal.addComponents(row1, row2, row3, row4);
        await interaction.showModal(modal);
    },
};