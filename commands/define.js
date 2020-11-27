const wordFile = require('../words/words');
const stringSimilarity = require('string-similarity');
const Discord = require('discord.js');

module.exports = {
	name: 'define',
	description: 'searches for the definition of a term in our database',
	args: true,
	execute(message, args) {

		const keys = Object.keys(wordFile);
		const inputString = args[0].toLowerCase();


		if (keys.includes(inputString)) {
			const word = keys.find(elem => elem === inputString);
			const msg = Object.values(wordFile[word]);

			const embedMessage = new Discord.MessageEmbed()
				.setColor('#ffff99')
				.setDescription(`${msg}`);

			return message.channel.send(embedMessage);
		}


		else {
			const match = stringSimilarity.findBestMatch(inputString, keys);
			const bestMatch = keys[match.bestMatchIndex];
			return message.channel.send(`did you mean ${bestMatch}?`);
		}

	},
};
