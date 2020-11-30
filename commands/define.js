const wordFile = require('../words/words.json');
const stringSimilarity = require('string-similarity');
const Discord = require('discord.js');

let pages = [];
let page = 1;
let matchFound = false;


module.exports = {
	name: 'define',
	description: 'searches for the definition of a term in our database',
	args: true,
	execute(message, args) {

		const keys = Object.keys(wordFile);

		const inputString = args.join().toLowerCase();
		matchFound = false;

		let x;

		for(x = 0; x < keys.length; x++) {
			const tempVar = stringSimilarity.compareTwoStrings(`${inputString}`, `${keys[x]}`);
			if (tempVar === 1) {
				const word = keys.find(elem => elem === inputString);
				const msg = Object.values(wordFile[word]);

				const embedMessage = new Discord.MessageEmbed()
					.setColor('#ffff99')
					.setDescription(`${msg}`);

				matchFound = true;
				return message.channel.send(embedMessage);
			}
		}


		if (matchFound === false) {

			let i;
			pages = [];
			page = 1;

			for (i = 0; i < keys.length; i++) {
				const tempVar = stringSimilarity.compareTwoStrings(inputString, keys[i]);
				if (tempVar > 0.6) {
					const word = keys.find(elem => elem === keys[i]);
					const msg = Object.values(wordFile[word]);
					pages.push(msg);
				}
			}
			const pageSize = pages.length;

			if (pageSize === 0) {
				message.channel.send('could not find any matches');

			}

			else {
				const embedMessage = new Discord.MessageEmbed()
					.setTitle('Did You Mean One Of These?')
					.setColor('#ffff99')
					.setFooter(`Page ${page} of ${pages.length}`)
					.setDescription(pages[page - 1]);

				message.channel.send(embedMessage).then(msg => {
					// eslint-disable-next-line no-unused-vars
					msg.react('◀️').then(_r => {
						msg.react('▶️');

						const backwardsFilter = (reaction, user) => reaction.emoji.name === '◀️' && user.id === message.author.id;
						const forwardsFilter = (reaction, user) => reaction.emoji.name === '▶️' && user.id === message.author.id;

						const backwards = msg.createReactionCollector(backwardsFilter, { time: 60000 });
						const forwards = msg.createReactionCollector(forwardsFilter, { time: 60000 });

						backwards.on('collect', (reaction, user) => {
							if (page === 1) return;
							page--;
							embedMessage.setDescription(pages[page - 1]);
							embedMessage.setFooter(`Page ${page} of ${pages.length}`);
							reaction.users.remove(user);
							msg.edit(embedMessage);
						});
						forwards.on('collect', (reaction, user) => {
							if (page === pages.length) return;
							page++;
							embedMessage.setDescription(pages[page - 1]);
							embedMessage.setFooter(`Page ${page} of ${pages.length}`);
							reaction.users.remove(user);
							msg.edit(embedMessage);
						});
					});
				});
			}
		}
	},
};
