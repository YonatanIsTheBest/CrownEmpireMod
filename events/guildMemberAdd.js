const config = require('../config.json');

module.exports = {
    name: 'guildMemberAdd',
    execute(member) {
        const roleId = config.memberRoleId;
        const role = member.guild.roles.cache.get(roleId);

        if (!role) {
            console.error(`Error: Could not find the role with ID ${roleId}`);
            return;
        }

        member.roles.add(role)
            .then(() => console.log(`Assigned Member role to ${member.user.tag}`))
            .catch(error => console.error(`Failed to assign role:`, error));
    },
};