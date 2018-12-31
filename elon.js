// elon-chan server bot

const Discord = require('discord.js');
var logger = require('winston');
const config = require('./config.json');

const client = new Discord.Client();

// winston logger
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';

// login watcher
client.on('ready', () => {
  logger.info('Connected');
  logger.info(`Logged in as ${client.user.tag}!`);
});

// messages watcher
client.on('message', msg => {
  if (msg.content.substring(0, 2) == config.prefix) {
    const args = msg.content.substring(2).split(' ');
    const cmd = args[0];

    switch(cmd) {
      case 'ping':
        msg.reply('Pong!');
        break;
      default:
        // X points to/for Y
        const points = parseInt(cmd, 10);

        if (!isNaN(points) && // if not undefined
          args.length == 4 && // command has 4 words
          (args[1] === 'points' || args[1] === 'pts') && // proper words
          (args[2] === 'for' || args[2] === 'to') // for or to
        ) {

          // ensure sender is authorized to give points
          const sender = msg.member;
          if (!sender.roles.find(role => role.name === config.role)) {
            logger.info(`${msg.user.tag} not authorized to give points`);
            msg.reply('you are not authorized to give points!');
            break;
          }

          // ensure points given are greater than 0
          if (points <= 0) {
            logger.info(`${msg.user.tag} could not give <= 0 points`);
            msg.reply('you can\'t give 0 or less points to a user!');
            break;
          }

          // TODO: save things to database

          // respond to user that points were given to a member
          var reciever = args[3];
          logger.info(`pts: ${points}`);
          logger.info(`given to: ${reciever}`)
          msg.reply(`\npts: ${points} \nto: ${reciever}`);
        }
    }
  }
});

client.login(config.token);