const Command = require('../../structures/Command');
const { MersenneTwister19937, integer } = require('random-js');
const { createCanvas, loadImage } = require('canvas');
const request = require('node-superfetch');
const path = require('path');
const { GIRLFRIEND_USER_ID } = process.env;
const thoughts = require('../../assets/json/think-of');

module.exports = class ThinkOfCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'think-of',
			aliases: ['thinks-of', 'thoughts-on', 't-of'],
			group: 'random-seed',
			memberName: 'think-of',
			description: 'Determines what a user thinks of another user.',
			throttling: {
				usages: 1,
				duration: 10
			},
			clientPermissions: ['ATTACH_FILES'],
			credit: [
				{
					name: 'Attype Studio',
					url: 'https://www.dafont.com/fadli-ramadhan-iskandar.d7339',
					reason: 'Pinky Cupid Font',
					reasonURL: 'https://www.dafont.com/pinky-cupid.font'
				}
			],
			args: [
				{
					key: 'first',
					label: 'first user',
					prompt: 'Who is the user doing the thinking?',
					type: 'user'
				},
				{
					key: 'second',
					label: 'second user',
					prompt: 'What user should they think about?',
					type: 'user',
					default: msg => msg.author
				}
			]
		});
	}

	async run(msg, { first, second }) {
		let thought;
		const self = first.id === second.id;
		const owner = this.client.isOwner(first) || this.client.isOwner(second);
		const authorUser = first.id === msg.author.id || second.id === msg.author.id;
		const botUser = first.id === this.client.user.id || second.id === this.client.user.id;
		const girlfriendUser = first.id === GIRLFRIEND_USER_ID || second.id === GIRLFRIEND_USER_ID;
		if (owner && botUser) {
			thought = thoughts[8];
		} else if (self) {
			thought = thoughts[0];
		} else if (girlfriendUser && owner) {
			thought = thoughts[5];
		} else {
			const calculated = Math.abs(Number.parseInt(BigInt(first.id) - BigInt(second.id), 10));
			const random = MersenneTwister19937.seed(calculated);
			thought = thoughts[integer(0, thoughts.length - 1)(random)];
		}
		const firstAvatarURL = first.displayAvatarURL({ format: 'png', size: 512 });
		const secondAvatarURL = second.displayAvatarURL({ format: 'png', size: 512 });
		try {
			const firstAvatarData = await request.get(firstAvatarURL);
			const firstAvatar = await loadImage(firstAvatarData.body);
			const secondAvatarData = await request.get(secondAvatarURL);
			const secondAvatar = await loadImage(secondAvatarData.body);
			const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'friendship.png'));
			const canvas = createCanvas(base.width, base.height);
			const ctx = canvas.getContext('2d');
			ctx.drawImage(firstAvatar, 70, 56, 400, 400);
			ctx.drawImage(secondAvatar, 730, 56, 400, 400);
			ctx.drawImage(base, 0, 0);
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			ctx.fillStyle = 'green';
			ctx.font = this.client.fonts.get('Pinky Cupid.otf').toCanvasString(40);
			ctx.fillText('~Xiao\'s Thought Reader~', 600, 15);
			ctx.fillStyle = 'white';
			ctx.fillText(first.username, 270, 448);
			ctx.fillText(second.username, 930, 448);
			ctx.fillStyle = thought.color;
			ctx.font = this.client.fonts.get('Pinky Cupid.otf').toCanvasString(20);
			ctx.fillText('thinks this user is', 600, 230);
			ctx.font = this.client.fonts.get('Pinky Cupid.otf').toCanvasString(50);
			ctx.fillText(thought.text, 600, 296);
			ctx.font = this.client.fonts.get('Pinky Cupid.otf').toCanvasString(90);
			ctx.fillText(thought.emoji, 600, 100);
			return msg.say({ files: [{ attachment: canvas.toBuffer(), name: 'think-of.png' }] });
		} catch (err) {
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}

	calculateLevelText(level, self, owner, authorUser, botUser) {
		if (owner && botUser) {
			if (authorUser) return 'Pervert';
			else return 'Yuck';
		}
		if (self) return 'Narcissist';
		if (level === 0) return 'Abysmal';
		if (level > 0 && level < 10) return 'Horrid';
		if (level > 9 && level < 20) return 'Awful';
		if (level > 19 && level < 30) return 'Very Bad';
		if (level > 29 && level < 40) return 'Bad';
		if (level > 39 && level < 50) return 'Poor';
		if (level > 49 && level < 60) return 'Average';
		if (level > 59 && level < 70) {
			if (level === 69) return 'Nice';
			return 'Fine';
		}
		if (level > 69 && level < 80) return 'Good';
		if (level > 79 && level < 90) return 'Great';
		if (level > 89 && level < 100) return 'Amazing';
		if (level === 100) return 'Soulmates';
		return '???';
	}
};
