// elon-chan server bot

const Discord = require('discord.js');
const logger = require('winston');
const config = require('./config.json');

const client = new Discord.Client();

//SQLite constants
const SQLite = require("better-sqlite3");
const sql = new SQLite('./scores.sqlite');

// winston logger
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';

// ready command
client.on('ready', () => {
  //Loads the logger
  logger.info('Connected');
  logger.info(`Logged in as ${client.user.tag}!`);

  //loads the SQL database
  // code from: https://anidiots.guide/coding-guides/sqlite-based-points-system
  // Check if the table "points" exists.
  const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scores';").get();
  if (!table['count(*)']) {
      // If the table isn't there, create it and setup the database correctly.
      sql.prepare("CREATE TABLE scores (id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER);").run();
      // Ensure that the "id" row is always unique and indexed.
      sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON scores (id);").run();
      sql.pragma("synchronous = 1");
      sql.pragma("journal_mode = wal");
  }
 
    // And then we have two prepared statements to get and set the score data.
  client.getScore = sql.prepare("SELECT * FROM scores WHERE user = ? AND guild = ?");
  client.setScore = sql.prepare("INSERT OR REPLACE INTO scores (id, user, guild, points) VALUES (@id, @user, @guild, @points);");
});

// messages watcher
client.on('message', msg => {
  if (message.author.bot) return; // Makes sure the message is not from another bot
  if (message.guild) { // These commands will only activate in a server and not in DMs
    if (msg.content.substring(0, 2) == config.prefix) {
      const args = msg.content.substring(2).split(' ');
      const cmd = args[0];

      switch(cmd) {
        case 'ping':
          msg.reply('Pong!');
          break;
        case 'score': // Tells a user how many points they have
          const userPoints = client.getScore.get(message.author.id, message.guild.id);
          message.reply(`You currently have ${userPoints} points.`);
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
            let score;
            // NOTE: The current code only attempts to store points for each individual user, no team implementation is in place
            score = client.getScore.get(message.author.id, message.guild.id); // gets the current score for the user that sent the message
            if (!score) { // if that score doesn't exist, create a new user
                score = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, points: 0 }
                // TODO: add implementaion to ask the point assigner to set a team for the new User
            }
            score.points++; // add the points to the user's total
            client.setScore.run(score); // Set the user's score in the database to the new score

            // respond to user that points were given to a member
            var reciever = args[3];
            logger.info(`pts: ${points}`);
            logger.info(`given to: ${reciever}`)
            msg.reply(`\npts: ${points} \nto: ${reciever}`);
          }
      }
    }
  }
});

client.login(config.token);