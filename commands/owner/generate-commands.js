const Command = require('../../structures/Command');
const request = require('node-superfetch');

module.exports = class GenerateCommandsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'generate-commands',
			aliases: ['gen-commands'],
			group: 'owner',
			memberName: 'generate-commands',
			description: 'Generates the commands list for Xiao\'s README.',
			ownerOnly: true,
			guarded: true
		});
	}

	async run(msg) {
		const list = client.registry.groups
			.filter(g => g.id !== 'owner')
			.map(g => `\n### ${g.name}:\n\n${g.commands.map(c => `* **${c.name}:** ${c.description}`).join('\n')}`);
		const { body } = await request
			.post('https://hastebin.com/documents')
			.send(list.join('\n'));
		return msg.say(`https://hastebin.com/raw/${body.key}`);
	}
};
