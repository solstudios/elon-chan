var Discord = require('discord.io');
var logger = require('winston');
var config = require('./config.json');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var client = new Discord.Client({
  token: config.token,
  autorun: true
});

client.on('ready', function (evt) {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(client.username + ' - (' + client.id + ')');
});

client.on('message', function (user, userID, channelID, message, evt) {
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`
  if (message.substring(0, 2) == config.prefix) {
    var args = message.substring(2).split(' ');
    var cmd = args[0];

    // args = args.splice(2);
    switch(cmd) {
        // !ping
      case 'ping':
        client.sendMessage({
          to: channelID,
          message: 'Pong!'
        });
        break;
      default:
        // 2 points for @gryffindor
        // or
        // 2 points to @gryfindor
        var points = parseInt(cmd, 10);
        /*
        console.log(args);
        console.log(points);
        console.log(!isNaN(points));
        console.log(args[1]);
        console.log(args[2]);
        */
        if (!isNaN(points) && // if not undefined
          args.length == 4 &&
          args[1] === "points" &&
          (args[2] === "for" || args[2] === "to")
        ) {
          var reciever = args[3];
          client.sendMessage({
            to: channelID,
            message: `pts: ${points} \nto: ${reciever}`,
          });
        }

        //otherwise, is undefined

        // Just add any case commands if you want to..

    }
  }
});